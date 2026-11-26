import {createInterface} from 'node:readline';
import crypto from 'node:crypto';
import {promisify} from 'node:util';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {WorkshopStore} from './workshop-store.mjs';

console.log('Esperando configuración por entrada protegida.');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
const input=createInterface({input:process.stdin,terminal:false});
input.once('line',async line=>{
 input.close();
 if(process.stdin.isTTY)process.stdin.setRawMode(false);
 process.stdin.pause();
 try {
  const config=JSON.parse(line),store=new WorkshopStore(config.url);
  if(config.mode==='migrate'||config.mode==='validate')await store.migrate();
  if(config.mode==='validate'){
   const id=crypto.randomUUID(),salt=crypto.randomBytes(32).toString('hex');
   const hash=(await promisify(crypto.scrypt)('Frase de prueba sin participante',salt,64)).toString('hex');
   await store.createUser({id,username:'prueba.'+id,name:'Participante de prueba',role:'student',salt,hash});
   await store.saveProgress(id,2,7,{opened:true,answer:1,explained:true,completed:true});
   await Promise.all([store.addSeconds(id,2,7,20),store.addSeconds(id,2,7,20)]);
   const reopened=new WorkshopStore(config.url),rows=await reopened.progress(id);
   assert.equal(rows.length,1);assert.equal(rows[0].seconds,40);assert.equal(rows[0].answer,1);assert.equal(rows[0].completed,true);
   const columns=await reopened.sql.query("SELECT column_name FROM information_schema.columns WHERE table_name IN ('workshop_users','workshop_progress')",[]);
   assert.ok(!columns.some(c=>/date|time|created|updated|at$/.test(c.column_name)));
   console.log('Migración y persistencia verificadas: avance independiente, segundos acumulados sin pérdida por concurrencia y tablas sin fechas.');
  }
  if(config.mode==='bootstrap'){
   await store.ready();
   const username='admin.talleres';
   if(await store.findUser(username))throw new Error('La cuenta de administración ya existe.');
   const password=crypto.randomBytes(24).toString('base64url'),salt=crypto.randomBytes(32).toString('hex');
   const hash=(await promisify(crypto.scrypt)(password,salt,64)).toString('hex');
   await store.createUser({id:crypto.randomUUID(),username,name:'Administración de talleres · Diana Pineda',role:'admin',active:true,mustChangePassword:true,salt,hash,version:1});
   await fs.mkdir('output',{recursive:true});
   await fs.writeFile('output/acceso-administracion-talleres.txt',[
    'Acceso de administración de los talleres de IA',
    'Dirección: https://aula-ia-univalle.onrender.com/aula/acceso.html',
    'Usuario: '+username,
    'Contraseña temporal: '+password,
    '',
    'El primer ingreso solicita una contraseña nueva. Conserve este archivo en un lugar privado.',
    'Tras ingresar, abra Administración para crear las cuentas de estudiantes y consultar sus informes.',
    'La cuenta de talleres es independiente de las cuentas de otros recursos de IA Hub.'
   ].join('\n'),{mode:0o600,flag:'wx'});
   console.log('Cuenta administradora creada. Credenciales en output/acceso-administracion-talleres.txt, fuera de Git.');
  }
  if(config.mode==='migrate')console.log('Esquema del aula preparado.');
 }catch(e){console.error('No se completó la preparación: '+(e.code||e.name||'error'));process.exitCode=1;}
});
