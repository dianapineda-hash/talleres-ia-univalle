import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {passwordRecord,passwordMatches} from './workshop-crypto.mjs';
import {createWorkshopApp} from './workshop-app.mjs';

const initial='Clave de prueba para talleres 7341';
const changed='Otra clave de prueba para talleres 9264';
const copy=value=>structuredClone(value);
class MemoryStore{
 constructor(users){this.users=new Map(users.map(u=>[u.id,copy(u)]));this.records=new Map();this.failSave=false;this.failSeconds=false;this.failRead=false}
 async findUser(username){if(this.failRead)throw Error('PRIVATE DATABASE ERROR');return copy([...this.users.values()].find(u=>u.username===username))}
 async userById(id){if(this.failRead)throw Error('PRIVATE DATABASE ERROR');return copy(this.users.get(id))}
 async listStudents(){return copy([...this.users.values()].filter(u=>u.role==='student'))}
 async createUser(user){this.users.set(user.id,copy(user));return copy(user)}
 async updateUser(id,patch){Object.assign(this.users.get(id),copy(patch));return this.userById(id)}
 async progress(id){return copy([...this.records.values()].filter(r=>r.userId===id))}
 entry(id,course,unit){const key=[id,course,unit].join(':');if(!this.records.has(key))this.records.set(key,{userId:id,course,unit,opened:false,answer:null,explained:false,completed:false,seconds:0});return this.records.get(key)}
 async saveProgress(id,course,unit,patch){if(this.failSave)throw Error('PRIVATE DATABASE ERROR');Object.assign(this.entry(id,course,unit),copy(patch))}
 async addSeconds(id,course,unit,seconds){if(this.failSeconds)throw Error('PRIVATE DATABASE ERROR');const row=this.entry(id,course,unit);row.seconds+=seconds;row.opened=true}
}
async function fixture(){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'aula-app-test-'));
 const names=['acceso.html','acceso.js','acceso.css','index.html','taller-1.html','taller-2.html','aula.js','aula.css','aula-contenido.js','administracion.html','administracion.js'];
 for(const name of names)await fs.writeFile(path.join(root,name),'WORKSHOP FILE '+name);
 await fs.mkdir(path.join(root,'media'));await fs.writeFile(path.join(root,'media','logo-univalle.jpg'),'LOGO');
 await fs.writeFile(path.join(root,'hidden.json'),'NEVER SERVE');
 const credentials=await passwordRecord(initial),users=[
  {id:'admin-1',username:'administradora',name:'Administradora',role:'admin',active:true,mustChangePassword:false,version:1,...credentials},
  {id:'student-1',username:'profesor',name:'Profesor de prueba',role:'student',active:true,mustChangePassword:false,version:1,...credentials},
  {id:'student-2',username:'profesora',name:'Profesora de prueba',role:'student',active:true,mustChangePassword:false,version:1,...credentials},
  {id:'student-3',username:'temporal',name:'Ingreso temporal',role:'student',active:true,mustChangePassword:true,version:1,...credentials}
 ];
 const store=new MemoryStore(users);let time=1000;
 const app=createWorkshopApp({store,root,courses:{1:{units:Array(7)},2:{units:Array(7)}},clock:()=>time});
 const server=http.createServer(async(req,res)=>{if(!await app.handle(req,res,new URL(req.url,'http://localhost'))){res.writeHead(404);res.end('Not here')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 async function request(route,{method='GET',body,cookie,headers={},raw}={}){
  const response=await fetch(origin+route,{method,redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...(body!==undefined||raw!==undefined?{'Content-Type':'application/json',Origin:origin}:{}),...headers},...(body!==undefined||raw!==undefined?{body:raw??JSON.stringify(body)}:{})});
  const data=response.headers.get('content-type')?.includes('application/json')?await response.json():await response.text();return {status:response.status,headers:response.headers,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
 }
 const login=async(username='profesor',password=initial)=>request('/aula/api/login',{method:'POST',body:{username,password}});
 return {root,store,app,request,login,setTime:v=>{time=v},advance:v=>{time+=v},async close(){app.close();await new Promise(resolve=>server.close(resolve));const resolved=path.resolve(root);if(path.dirname(resolved)!==path.resolve(os.tmpdir())||!path.basename(resolved).startsWith('aula-app-test-'))throw Error('Unexpected test directory');await fs.rm(resolved,{recursive:true,force:true})}};
}

test('Acceso privado, funciones separadas y cambio de contraseña temporal',async()=>{
 const f=await fixture();try{
  assert.deepEqual((await f.request('/aula/api/session')).data,{user:null});
  assert.equal((await f.request('/aula/acceso.html')).status,200);assert.equal((await f.request('/aula/media/logo-univalle.jpg')).status,200);
  for(const asset of ['index.html','taller-1.html','taller-2.html','aula.js','aula-contenido.js']){const r=await f.request('/aula/'+asset);assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/aula/acceso.html?next='+encodeURIComponent('/aula/'+asset));assert.ok(!String(r.data).includes('WORKSHOP FILE'))}
  assert.equal((await f.request('/aula/api/progress')).status,401);assert.equal((await f.request('/aula/api/admin/students')).status,401);
  const member=await f.login();assert.equal(member.status,200);assert.match(member.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);assert.ok(!JSON.stringify(member.data).includes('hash'));assert.ok(!JSON.stringify(member.data).includes('salt'));
  assert.equal((await f.request('/aula/taller-2.html',{cookie:member.cookie})).status,200);
  assert.equal((await f.request('/aula/administracion.html',{cookie:member.cookie})).status,403);assert.equal((await f.request('/aula/administracion.js',{cookie:member.cookie})).status,403);
  assert.equal((await f.request('/aula/api/admin/students',{cookie:member.cookie})).status,403);
  const temp=await f.login('temporal');assert.equal(temp.data.user.mustChangePassword,true);
  assert.equal((await f.request('/aula/index.html',{cookie:temp.cookie})).status,303);
  assert.equal((await f.request('/aula/taller-2.html',{cookie:temp.cookie})).headers.get('location'),'/aula/acceso.html?next='+encodeURIComponent('/aula/taller-2.html'));
  const denied=await f.request('/aula/api/progress',{cookie:temp.cookie});assert.equal(denied.status,403);assert.equal(denied.data.code,'PASSWORD_CHANGE_REQUIRED');
  const newPassword=await f.request('/aula/api/password',{cookie:temp.cookie,method:'POST',body:{current:initial,password:changed}});assert.equal(newPassword.status,200);assert.equal(newPassword.data.user.mustChangePassword,false);
  assert.equal((await f.request('/aula/api/session',{cookie:temp.cookie})).data.user,null);assert.equal((await f.request('/aula/index.html',{cookie:newPassword.cookie})).status,200);
  assert.equal((await f.login('temporal',initial)).status,401);assert.equal((await f.login('temporal',changed)).status,200);
  const logout=await f.request('/aula/api/logout',{cookie:member.cookie,method:'POST',body:{}});assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);assert.equal((await f.request('/aula/api/session',{cookie:member.cookie})).data.user,null);
 }finally{await f.close()}
});

test('Administración de participantes, revocación y ausencia de fechas o secretos',async()=>{
 const f=await fixture();try{
  const admin=await f.login('administradora'),member=await f.login();
  const created=await f.request('/aula/api/admin/students',{method:'POST',cookie:admin.cookie,body:{username:'  Nuevo.1 ',name:'Profesora de empresa'}});
  assert.equal(created.status,201);assert.equal(created.data.user.username,'nuevo.1');assert.equal(created.data.password.length,24);assert.equal(created.data.user.mustChangePassword,true);assert.equal(created.data.user.role,'student');assert.ok(await passwordMatches(created.data.password,await f.store.userById(created.data.user.id)));
  assert.equal((await f.request('/aula/api/admin/students',{method:'POST',cookie:admin.cookie,body:{username:'nuevo.1',name:'Duplicado'}})).status,409);
  assert.equal((await f.request('/aula/api/admin/students',{method:'POST',cookie:admin.cookie,body:{username:'intruso',name:'Intruso',role:'admin'}})).status,400);
  const list=await f.request('/aula/api/admin/students',{cookie:admin.cookie});assert.equal(list.status,200);assert.equal(list.data.students.length,4);assert.ok(list.data.students.every(s=>s.role==='student'));
  assert.doesNotMatch(JSON.stringify(list.data),/"(?:hash|salt|password|createdAt|updatedAt|at|expires)"/);
  assert.equal((await f.request('/aula/api/admin/students/admin-1',{method:'PATCH',cookie:admin.cookie,body:{active:false}})).status,404);
  const disabled=await f.request('/aula/api/admin/students/student-1',{method:'PATCH',cookie:admin.cookie,body:{active:false}});assert.equal(disabled.status,200);assert.equal((await f.request('/aula/api/session',{cookie:member.cookie})).data.user,null);
  assert.equal((await f.login()).status,401);
  await f.request('/aula/api/admin/students/student-1',{method:'PATCH',cookie:admin.cookie,body:{active:true}});
  const fresh=await f.login(),reset=await f.request('/aula/api/admin/students/student-1/reset',{method:'POST',cookie:admin.cookie,body:{}});assert.equal(reset.status,200);assert.equal((await f.request('/aula/api/session',{cookie:fresh.cookie})).data.user,null);assert.equal((await f.login('profesor',reset.data.password)).data.user.mustChangePassword,true);
 }finally{await f.close()}
});

test('Navegación libre y progreso aislado por participante',async()=>{
 const f=await fixture();try{
  const a=await f.login(),b=await f.login('profesora');
  const patch=await f.request('/aula/api/progress',{method:'PATCH',cookie:a.cookie,body:{course:2,unit:7,opened:true,answer:1,explained:true,completed:true}});assert.equal(patch.status,200);assert.deepEqual(patch.data.progress,[{course:2,unit:7,opened:true,answer:1,explained:true,completed:true,seconds:0}]);
  assert.deepEqual((await f.request('/aula/api/progress',{cookie:b.cookie})).data.progress,[]);
  assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:a.cookie,body:{course:1,unit:1,completed:true}})).status,200);
  assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:a.cookie,body:{course:2,unit:7,completed:false,answer:0}})).status,200);
  for(const body of [{course:3,unit:1,opened:true},{course:1,unit:0,opened:true},{course:1,unit:8,opened:true},{course:'1',unit:1,opened:true},{course:1,unit:1,completed:'true'},{course:1,unit:1,answer:2},{course:1,unit:1,userId:'student-2',opened:true},{course:1,unit:1,seconds:500},{course:1,unit:1,createdAt:'NOW'},{course:1,unit:1}])assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:a.cookie,body})).status,400,JSON.stringify(body));
  const state=await f.request('/aula/api/progress',{cookie:a.cookie});assert.doesNotMatch(JSON.stringify(state.data),/"(?:userId|createdAt|updatedAt|date|time)"/);
 }finally{await f.close()}
});

test('Duración monotónica real, pestañas simultáneas y pausas sin doble cuenta',async()=>{
 const f=await fixture();try{
  const user=await f.login();const pulse=body=>f.request('/aula/api/pulse',{method:'POST',cookie:user.cookie,body:{course:1,unit:7,active:true,tabId:'tab-first-123',...body}});
  assert.deepEqual((await pulse({})).data,{seconds:0,totalSeconds:0});
  f.advance(15000);assert.deepEqual((await pulse({})).data,{seconds:15,totalSeconds:15});
  f.advance(10000);const simultaneous=await Promise.all([pulse({}),pulse({})]);assert.ok(simultaneous.every(r=>r.data.seconds===25));
  f.advance(10000);assert.equal((await pulse({tabId:'tab-other-456'})).data.seconds,25);
  f.advance(10000);assert.equal((await pulse({tabId:'tab-other-456'})).data.seconds,35);
  f.advance(10000);assert.equal((await pulse({course:2,unit:2})).data.totalSeconds,0);
  f.advance(10000);assert.deepEqual((await pulse({course:2,unit:2})).data,{seconds:10,totalSeconds:10});
  f.advance(10000);assert.equal((await pulse({course:2,unit:2,active:false})).data.seconds,20);
  f.advance(10000);assert.equal((await pulse({course:2,unit:2})).data.seconds,20);
  f.advance(45001);assert.equal((await pulse({course:2,unit:2})).data.seconds,20);
  f.advance(500);assert.equal((await pulse({course:2,unit:2})).data.seconds,20);f.advance(500);assert.equal((await pulse({course:2,unit:2})).data.seconds,21);
  f.advance(10000);assert.equal((await pulse({active:false,tabId:'hidden-tab-987'})).data.seconds,35);
  f.advance(10000);assert.equal((await pulse({course:2,unit:2})).data.seconds,41);
  assert.equal((await pulse({seconds:240000})).status,400);assert.equal((await pulse({active:'true'})).status,400);assert.equal((await pulse({tabId:'x'})).status,400);assert.equal((await pulse({userId:'student-2'})).status,400);
  assert.equal([...f.store.records.values()].reduce((n,r)=>n+r.seconds,0),76);assert.doesNotMatch(JSON.stringify([...f.store.records.values()]),/"(?:at|createdAt|last|date|time)"/);
 }finally{await f.close()}
});

test('Fallos de persistencia no notifican éxito ni acreditan tramos pendientes',async()=>{
 const f=await fixture();try{
  const user=await f.login();f.store.failSave=true;
  const failed=await f.request('/aula/api/progress',{method:'PATCH',cookie:user.cookie,body:{course:1,unit:1,completed:true}});assert.equal(failed.status,503);assert.ok(!JSON.stringify(failed.data).includes('PRIVATE'));assert.deepEqual(await f.store.progress('student-1'),[]);
  f.store.failSave=false;const pulse=()=>f.request('/aula/api/pulse',{method:'POST',cookie:user.cookie,body:{course:1,unit:1,active:true,tabId:'failure-tab-123'}});
  await pulse();f.advance(10000);f.store.failSeconds=true;assert.equal((await pulse()).status,503);
  f.store.failSeconds=false;f.advance(10000);assert.equal((await pulse()).data.seconds,0);f.advance(10000);assert.equal((await pulse()).data.seconds,10);
  f.store.failRead=true;assert.equal((await f.request('/aula/api/session',{cookie:user.cookie})).status,503);assert.equal((await f.request('/aula/acceso.html',{cookie:user.cookie})).status,200);
 }finally{await f.close()}
});

test('La pausa conserva su duración por apartado y no acredita actividades ni finalización',async()=>{
 const f=await fixture();try{
  const user=await f.login();f.store.entry('student-1',1,4).seconds=17990;
  const pulse=()=>f.request('/aula/api/pulse',{method:'POST',cookie:user.cookie,body:{course:1,unit:4,active:true,tabId:'pause-tab-123'}});
  assert.deepEqual((await pulse()).data,{seconds:17990,totalSeconds:17990});f.advance(20000);assert.deepEqual((await pulse()).data,{seconds:18010,totalSeconds:18010});
  const admin=await f.login('administradora'),response=await f.request('/aula/api/admin/students',{cookie:admin.cookie});const participant=response.data.students.find(s=>s.id==='student-1');
  assert.deepEqual(participant.progress,[{course:1,unit:4,opened:true,answer:null,explained:false,completed:false,seconds:18010}]);
  assert.equal(participant.progress.filter(p=>p.unit!==4).reduce((n,p)=>n+p.seconds,0),0);assert.ok(!JSON.stringify(participant).includes('certified'));
  f.app.close();const afterRestart=await f.login();f.advance(100000);
  const resumed=await f.request('/aula/api/pulse',{method:'POST',cookie:afterRestart.cookie,body:{course:1,unit:4,active:true,tabId:'pause-tab-123'}});assert.equal(resumed.data.seconds,18010);
 }finally{await f.close()}
});

test('Origen, rutas, límites de entrada y caducidad de sesión',async()=>{
 const f=await fixture();try{
  const user=await f.login();const body={course:1,unit:1,opened:true};
  for(const headers of [{Origin:'https://external.test'},{Origin:''},{'Sec-Fetch-Site':'cross-site'}])assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:user.cookie,body,headers})).status,403);
  assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:user.cookie,body,headers:{'Content-Type':'text/plain'}})).status,415);
  assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:user.cookie,raw:'['})).status,400);
  assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:user.cookie,body:[]})).status,400);
  assert.equal((await f.request('/aula/api/progress',{method:'PATCH',cookie:user.cookie,body:{...body,value:'x'.repeat(9000)}})).status,413);
  for(const route of ['/aula/hidden.json','/aula/auth-bootstrap.json','/aula/%2e%2e%2fhidden.json','/aula/media%5clogo-univalle.jpg','/aula/%252e%252e/hidden.json']){const r=await f.request(route,{cookie:user.cookie});assert.ok([400,404].includes(r.status),route);assert.ok(!String(r.data).includes('NEVER SERVE'))}
  f.advance(8*60*60*1000+1);assert.equal((await f.request('/aula/api/session',{cookie:user.cookie})).data.user,null);
  for(let i=0;i<10;i++)assert.equal((await f.login('profesor','Incorrecta12345')).status,401);assert.equal((await f.login('profesor','Incorrecta12345')).status,429);
 }finally{await f.close()}
});
