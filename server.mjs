import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WorkshopStore} from './workshop-store.mjs';
import {createWorkshopApp} from './workshop-app.mjs';
import {contenido} from './aula-contenido.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const production=process.env.NODE_ENV==='production';
if(!process.env.WORKSHOP_DATABASE_URL)throw new Error('Configure la conexión del aula antes de iniciar el servicio.');
const store=new WorkshopStore(process.env.WORKSHOP_DATABASE_URL);
await store.ready();
const app=createWorkshopApp({store,root,production,origin:process.env.WORKSHOP_ORIGIN,courses:contenido.courses});
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 let url;try{url=new URL(req.url,'http://localhost')}catch{res.writeHead(400);res.end();return}
 if(url.pathname==='/healthz'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"status":"ok"}');return}
 if(url.pathname==='/'){res.writeHead(303,{Location:'/aula/'});res.end();return}
 try{if(await app.handle(req,res,url))return;}catch{res.writeHead(503);res.end('El aula no está disponible en este momento.');return}
 res.writeHead(404);res.end('Recurso no encontrado.');
});
server.listen(Number(process.env.PORT||5086),production?'0.0.0.0':'127.0.0.1',()=>console.log('Aula de talleres disponible.'));
process.once('SIGTERM',()=>{app.close();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),10000).unref()});
