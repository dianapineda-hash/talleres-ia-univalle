import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {passwordRecord, passwordMatches} from './workshop-crypto.mjs';

const SESSION_MS=8*60*60*1000;
const COOKIE='aula_session';
const publicFiles=new Set(['acceso.html','acceso.js','acceso.css','aula.css','media/logo-univalle.jpg']);
const defaultPrivateFiles=['index.html','taller-1.html','taller-2.html','aula.js','aula.css','aula-contenido.js','administracion.html','administracion.js','seguimiento.js'];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'};
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const problem=(status,message,code)=>Object.assign(new Error(message),{status,code});
const userView=u=>u?{id:u.id,username:u.username,name:u.name,role:u.role,mustChangePassword:!!u.mustChangePassword}:null;
const progressView=p=>({course:Number(p.course),unit:Number(p.unit),opened:!!p.opened,answer:p.answer===null||p.answer===undefined?null:Number(p.answer),explained:!!p.explained,completed:!!p.completed,seconds:Math.max(0,Math.floor(Number(p.seconds)||0))});

/** A dedicated workshop application. Learning records contain no wall-clock fields. */
export function createWorkshopApp({store,root,production=false,origin,courses,clock=()=>performance.now(),allowedFiles=defaultPrivateFiles}){
 if(!store||!root||!courses)throw new Error('Workshop store, private root and courses are required.');
 const privateRoot=path.resolve(root),privateFiles=new Set(allowedFiles);
 const sessions=new Map(),attempts=new Map(),ledgers=new Map(),locks=new Map();
 const configuredOrigin=origin||(production?'https://aula-ia-univalle.onrender.com':null);
 const randomPassword=()=>crypto.randomBytes(18).toString('base64url');
 const reply=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 const redirect=(res,to)=>{res.writeHead(303,{Location:to,'Cache-Control':'no-store'});res.end();};
 const cookie=(value,clear=false)=>`${COOKIE}=${value}; Path=/aula; HttpOnly; SameSite=Strict; Max-Age=${clear?0:SESSION_MS/1000}${production?'; Secure':''}`;
 const now=()=>{const value=clock();if(!Number.isFinite(value))throw Error('Invalid monotonic clock');return value;};
 async function locked(id,work){
  const previous=locks.get(id)||Promise.resolve();let release;const barrier=new Promise(resolve=>{release=resolve});const chain=previous.catch(()=>{}).then(()=>barrier);locks.set(id,chain);
  await previous.catch(()=>{});try{return await work()}finally{release();if(locks.get(id)===chain)locks.delete(id)}
 }
 function rate(req,scope,max){
  const current=now();for(const [key,entry]of attempts)if(entry.until<=current)attempts.delete(key);
  const address=String(production?(req.headers['x-forwarded-for']||req.socket.remoteAddress):req.socket.remoteAddress).split(',').pop().trim();
  const key=scope+':'+address;const entry=attempts.get(key)||{count:0,until:current+15*60*1000};
  if(entry.count>=max||(!attempts.has(key)&&attempts.size>=10000))throw problem(429,'Demasiados intentos. Espere unos minutos antes de volver a intentarlo.');
  entry.count++;attempts.set(key,entry);return key;
 }
 function mutation(req){
  const expected=configuredOrigin||'http://'+req.headers.host;
  if(req.headers['sec-fetch-site']==='cross-site'||req.headers.origin!==expected)throw problem(403,'Origen no autorizado.');
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw problem(415,'Se requiere una solicitud JSON.');
 }
 async function read(req,allowed){
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>8192)throw problem(413,'La solicitud supera el tamaño permitido.');}
  let value;try{value=JSON.parse(body)}catch{throw problem(400,'Solicitud inválida.')}
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!allowed.includes(key)))throw problem(400,'Solicitud inválida.');return value;
 }
 function setSession(res,user){
  const current=now();for(const [key,entry]of sessions)if(entry.expires<=current)sessions.delete(key);
  if(sessions.size>=10000)throw problem(503,'No fue posible iniciar la sesión. Intente de nuevo.');
  const token=crypto.randomBytes(32).toString('base64url'),key=digest(token);sessions.set(key,{userId:user.id,version:user.version,expires:current+SESSION_MS});res.setHeader('Set-Cookie',cookie(token));return key;
 }
 async function session(req){
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
  const key=digest(token),entry=sessions.get(key);if(!entry)return null;
  if(entry.expires<=now()){sessions.delete(key);return null}
  const user=await store.userById(entry.userId);
  if(!user?.active||user.version!==entry.version){sessions.delete(key);ledgers.delete(entry.userId);return null}
  return {key,user};
 }
 function requireUser(active){if(!active)throw problem(401,'Ingrese con su usuario y contraseña.');}
 function requireReady(active){requireUser(active);if(active.user.mustChangePassword)throw problem(403,'Cambie su contraseña temporal para continuar.','PASSWORD_CHANGE_REQUIRED');}
 function requireAdmin(active){requireReady(active);if(active.user.role!=='admin')throw problem(403,'Esta función corresponde a la administración.');}
 async function requireCurrent(active){
  const current=await store.userById(active.user.id);
  const entry=sessions.get(active.key);
  if(!entry||entry.expires<=now()||!current?.active||current.version!==active.user.version)throw problem(401,'Ingrese nuevamente.');
  requireReady({user:current});
 }
 function unit(data){
  if(!Number.isInteger(data.course)||!Number.isInteger(data.unit)||!courses[data.course]||data.unit<1||data.unit>courses[data.course].units.length)throw problem(400,'Taller o actividad no válidos.');
 }
 const progress=async id=>(await store.progress(id)).map(progressView);
 const forgetUser=id=>{for(const [key,entry]of sessions)if(entry.userId===id)sessions.delete(key);ledgers.delete(id);};
 async function student(id){const found=await store.userById(id);if(!found||found.role!=='student')throw problem(404,'Participante no encontrado.');return found;}
 async function serve(req,res,file,active){
  if(!publicFiles.has(file)){
   if(!privateFiles.has(file))throw problem(404,'Recurso no encontrado.');
   if(!active||active.user.mustChangePassword){redirect(res,'/aula/acceso.html?next='+encodeURIComponent('/aula/'+file));return}
   if(file.startsWith('administracion')&&active.user.role!=='admin')throw problem(403,'Esta función corresponde a la administración.');
  }
  let resolved;try{resolved=await fs.realpath(path.join(privateRoot,file));const realRoot=await fs.realpath(privateRoot);if(!resolved.startsWith(realRoot+path.sep))throw problem(404,'Recurso no encontrado.');}catch(error){if(error.status)throw error;throw problem(404,'Recurso no encontrado.')}
  let content;try{content=await fs.readFile(resolved)}catch{throw problem(404,'Recurso no encontrado.')}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':content.length,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:content);
 }
 async function handle(req,res,url){
  let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{if(url.pathname.startsWith('/aula')){reply(res,400,{error:'Ruta inválida.'});return true}return false}
  if(pathname!=='/aula'&&!pathname.startsWith('/aula/'))return false;
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try{
   if(/[\\\0%]/.test(pathname)||pathname.split('/').some(part=>part==='.'||part==='..'))throw problem(400,'Ruta inválida.');
   const route=pathname.slice('/aula'.length)||'/';
   // Access assets do not depend on database availability.
   if(['GET','HEAD'].includes(req.method)&&publicFiles.has(route.slice(1))){await serve(req,res,route.slice(1),null);return true}
   const active=await session(req);
   if(req.method==='GET'&&route==='/api/session'){reply(res,200,{user:userView(active?.user)});return true}
   if(route.startsWith('/api/')){
    if(['POST','PATCH'].includes(req.method))mutation(req);
    if(req.method==='POST'&&route==='/api/login'){
     const key=rate(req,'login',10),data=await read(req,['username','password']);
     if(typeof data.username!=='string'||typeof data.password!=='string'||data.username.length>60)throw problem(400,'Revise el usuario y la contraseña.');
     const user=await store.findUser(data.username.trim().toLowerCase()),matches=await passwordMatches(data.password,user);
     if(!user?.active||!['admin','student'].includes(user.role)||!matches)throw problem(401,'Usuario o contraseña incorrectos.');
     attempts.delete(key);if(active)sessions.delete(active.key);setSession(res,user);reply(res,200,{user:userView(user)});return true;
    }
    if(req.method==='POST'&&route==='/api/logout'){
     await read(req,[]);if(active){sessions.delete(active.key);ledgers.delete(active.user.id)}res.setHeader('Set-Cookie',cookie('',true));reply(res,200,{user:null});return true;
    }
    if(req.method==='POST'&&route==='/api/password'){
     requireUser(active);rate(req,'password',8);const data=await read(req,['current','password']);
     if(typeof data.current!=='string'||typeof data.password!=='string')throw problem(400,'Revise la contraseña.');
     const updated=await locked(active.user.id,async()=>{
      const user=await store.userById(active.user.id);if(!user?.active||user.version!==active.user.version)throw problem(401,'Ingrese nuevamente.');
      if(!await passwordMatches(data.current,user))throw problem(400,'La contraseña actual no es correcta.');
      if(data.current===data.password)throw problem(400,'Elija una contraseña diferente.');
      const record=await passwordRecord(data.password);await store.updateUser(user.id,{...record,mustChangePassword:false,version:user.version+1});forgetUser(user.id);return await store.userById(user.id);
     });setSession(res,updated);reply(res,200,{user:userView(updated)});return true;
    }
    if(route.startsWith('/api/admin/')){
     requireAdmin(active);
     if(req.method==='GET'&&route==='/api/admin/students'){
      const students=[];for(const user of await store.listStudents()){if(user.role!=='student')continue;students.push({...userView(user),active:!!user.active,progress:await progress(user.id)})}reply(res,200,{students});return true;
     }
     if(req.method==='POST'&&route==='/api/admin/students'){
      rate(req,'create',50);const data=await read(req,['username','name']);
      if(typeof data.username!=='string'||typeof data.name!=='string')throw problem(400,'Revise el nombre y el usuario.');
      const username=data.username.trim().toLowerCase(),name=data.name.trim();
      if(!/^[a-z0-9][a-z0-9._-]{2,59}$/.test(username)||name.length<2||name.length>150)throw problem(400,'Use un nombre de 2 a 150 caracteres y un usuario de 3 a 60 con letras minúsculas, números, punto o guion.');
      const password=randomPassword(),record=await passwordRecord(password);
      const user=await locked('create:'+username,async()=>{if(await store.findUser(username))throw problem(409,'El nombre de usuario ya existe.');const created={id:crypto.randomUUID(),username,name,role:'student',active:true,mustChangePassword:true,version:1,...record};await store.createUser(created);return created});
      reply(res,201,{user:userView(user),password});return true;
     }
     const match=/^\/api\/admin\/students\/([a-zA-Z0-9-]{1,80})(\/reset)?$/.exec(route);
     if(match&&req.method==='POST'&&match[2]){
      rate(req,'reset',30);await read(req,[]);const password=randomPassword(),record=await passwordRecord(password);
      await locked(match[1],async()=>{const user=await student(match[1]);await store.updateUser(user.id,{...record,mustChangePassword:true,version:user.version+1});forgetUser(user.id)});reply(res,200,{password});return true;
     }
     if(match&&req.method==='PATCH'&&!match[2]){
      const data=await read(req,['active']);if(typeof data.active!=='boolean')throw problem(400,'Estado de cuenta no válido.');
      const user=await locked(match[1],async()=>{const found=await student(match[1]);await store.updateUser(found.id,{active:data.active,version:found.version+1});forgetUser(found.id);return await store.userById(found.id)});reply(res,200,{user:{...userView(user),active:!!user.active}});return true;
     }
     throw problem(404,'Ruta no encontrada.');
    }
    requireReady(active);
    if(req.method==='GET'&&route==='/api/progress'){reply(res,200,{progress:await progress(active.user.id)});return true}
    if(req.method==='PATCH'&&route==='/api/progress'){
     const data=await read(req,['course','unit','opened','answer','explained','completed']);unit(data);const patch={};
     for(const key of ['opened','explained','completed'])if(Object.hasOwn(data,key)){if(typeof data[key]!=='boolean')throw problem(400,'Estado de actividad no válido.');patch[key]=data[key]}
     if(Object.hasOwn(data,'answer')){if(data.answer!==null&&data.answer!==0&&data.answer!==1)throw problem(400,'Respuesta no válida.');patch.answer=data.answer}
     if(!Object.keys(patch).length)throw problem(400,'Indique el avance que desea guardar.');
     await locked(active.user.id,async()=>{await requireCurrent(active);await store.saveProgress(active.user.id,data.course,data.unit,patch)});reply(res,200,{progress:await progress(active.user.id)});return true;
    }
    if(req.method==='POST'&&route==='/api/pulse'){
     const data=await read(req,['course','unit','active','tabId']);unit(data);
     if(typeof data.active!=='boolean'||typeof data.tabId!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(data.tabId))throw problem(400,'Pulso de actividad no válido.');
     const result=await locked(active.user.id,async()=>{
      await requireCurrent(active);
      const current=now(),previous=ledgers.get(active.user.id);let seconds=0,remainder=0;
      const sameOwner=previous?.tabId===data.tabId&&previous.course===data.course&&previous.unit===data.unit;
      if(previous?.active&&sameOwner){const elapsed=current-previous.last;if(elapsed>=0&&elapsed<=45000){const total=elapsed+previous.remainder;seconds=Math.floor(total/1000);remainder=total-seconds*1000}}
      // Closing a hidden tab must not interrupt the visible tab's ledger.
      if(data.active||sameOwner||!previous)ledgers.set(active.user.id,{last:current,active:data.active,tabId:data.tabId,course:data.course,unit:data.unit,remainder:data.active?remainder:0});
      try{if(seconds)await store.addSeconds(active.user.id,data.course,data.unit,seconds);const records=await progress(active.user.id);return {seconds:records.find(p=>p.course===data.course&&p.unit===data.unit)?.seconds||0,totalSeconds:records.filter(p=>p.course===data.course).reduce((n,p)=>n+p.seconds,0)}}catch(error){ledgers.delete(active.user.id);throw error}
     });reply(res,200,result);return true;
    }
    throw problem(404,'Ruta no encontrada.');
   }
   if(!['GET','HEAD'].includes(req.method))throw problem(405,'Método no permitido.');
   if(route==='/'){redirect(res,!active||active.user.mustChangePassword?'/aula/acceso.html?next='+encodeURIComponent('/aula/index.html'):'/aula/index.html');return true}
   await serve(req,res,route.slice(1),active);return true;
  }catch(error){reply(res,error.status||503,{error:error.status?error.message:'No fue posible guardar o consultar la información. Intente de nuevo.',...(error.code&&error.status?{code:error.code}:{})});return true}
 }
 return {handle,close(){sessions.clear();attempts.clear();ledgers.clear();locks.clear()}};
}
