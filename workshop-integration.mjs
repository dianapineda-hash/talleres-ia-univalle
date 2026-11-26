import {createInterface} from 'node:readline';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {WorkshopStore} from './workshop-store.mjs';
import {createWorkshopApp} from './workshop-app.mjs';
import {passwordRecord} from './workshop-crypto.mjs';
import {contenido} from './aula-contenido.js';
import {reportHTML,studentCSV} from './administracion.js';

console.log('Esperando conexión de la rama de prueba por entrada protegida.');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
const input=createInterface({input:process.stdin,terminal:false});
input.once('line',async line=>{
 input.close();if(process.stdin.isTTY)process.stdin.setRawMode(false);process.stdin.pause();
 let running;
 try{
  const {url}=JSON.parse(line),store=new WorkshopStore(url),password=crypto.randomBytes(24).toString('base64url');
  const suffix=crypto.randomBytes(8).toString('hex');
  await store.createUser({id:crypto.randomUUID(),username:'admin.'+suffix,name:'Administración de prueba',role:'admin',active:true,mustChangePassword:false,version:1,...await passwordRecord(password)});
  let tick=0;
  const start=async()=>{
   const app=createWorkshopApp({store:new WorkshopStore(url),root:process.cwd(),courses:contenido.courses,clock:()=>tick});
   const server=http.createServer(async(req,res)=>{if(!await app.handle(req,res,new URL(req.url,'http://localhost'))){res.writeHead(404);res.end();}});
   await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
   return {app,server,origin:'http://127.0.0.1:'+server.address().port};
  };
  const stop=async()=>{running.app.close();await new Promise(resolve=>running.server.close(resolve));};
  running=await start();
  const request=async(path,{method='GET',body,cookie}={})=>{
   const res=await fetch(running.origin+'/aula'+path,{method,redirect:'manual',headers:{Origin:running.origin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
   const text=await res.text();let data;try{data=JSON.parse(text)}catch{data=text}
   return {status:res.status,data,headers:res.headers,cookie:res.headers.get('set-cookie')?.split(';')[0]};
  };
  assert.equal((await request('/aula-contenido.js')).status,303);
  const admin=await request('/api/login',{method:'POST',body:{username:'admin.'+suffix,password}});assert.equal(admin.status,200);
  const created=await request('/api/admin/students',{method:'POST',cookie:admin.cookie,body:{username:'estudiante.'+suffix,name:'Estudiante de verificación'}});assert.equal(created.status,201);
  let student=await request('/api/login',{method:'POST',body:{username:created.data.user.username,password:created.data.password}});assert.equal(student.status,200);
  assert.equal((await request('/taller-2.html',{cookie:student.cookie})).status,303);
  const newPassword=crypto.randomBytes(24).toString('base64url');
  student=await request('/api/password',{method:'POST',cookie:student.cookie,body:{current:created.data.password,password:newPassword}});assert.equal(student.status,200);
  assert.equal((await request('/taller-2.html',{cookie:student.cookie})).status,200);
  assert.equal((await request('/api/admin/students',{cookie:student.cookie})).status,403);
  const patch=await request('/api/progress',{method:'PATCH',cookie:student.cookie,body:{course:2,unit:7,opened:true,answer:1,explained:true,completed:true}});assert.equal(patch.status,200);
  const pulse=active=>request('/api/pulse',{method:'POST',cookie:student.cookie,body:{course:2,unit:7,active,tabId:'test-tab-integration'}});
  await pulse(true);tick+=20000;assert.equal((await pulse(true)).data.seconds,20);tick+=5000;assert.equal((await pulse(false)).data.seconds,25);
  await stop();running=await start();
  assert.equal((await request('/api/progress',{cookie:student.cookie})).status,401);
  student=await request('/api/login',{method:'POST',body:{username:created.data.user.username,password:newPassword}});
  const saved=await request('/api/progress',{cookie:student.cookie});assert.equal(saved.data.progress[0].seconds,25);assert.equal(saved.data.progress[0].unit,7);assert.equal(saved.data.progress[0].answer,1);
  const administrator=await request('/api/login',{method:'POST',body:{username:'admin.'+suffix,password}});
  const report=await request('/api/admin/students',{cookie:administrator.cookie});
  const user=report.data.students.find(s=>s.id===created.data.user.id);assert.ok(user);assert.equal(user.progress[0].completed,true);
  assert.doesNotMatch(JSON.stringify(user),/createdAt|updatedAt|expires|timestamp|\d{4}-\d{2}-\d{2}/);
  assert.match(reportHTML(user),/240 minutos/);assert.equal(studentCSV(user).split('\r\n').length,15);
  console.log('Flujo con base de datos verificado: ingreso, cambio de contraseña, actividad 7 sin requisitos, aislamiento, duración, reinicio con persistencia e informe de ambos talleres.');
 }catch(e){console.error('La integración falló: '+e.name+(e.code?' '+e.code:''));process.exitCode=1;}
 finally{if(running)try{running.app.close();await new Promise(resolve=>running.server.close(resolve))}catch{}}
});
