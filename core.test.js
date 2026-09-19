import test from 'node:test';import assert from 'node:assert/strict';import {empty,importClaims,restore,csv,prompt} from './core.js';import{sessions}from './content.js';import{standalone}from './standalone.js';
const sources=[{id:'S1',title:'Prueba',doi:'',wos:'Pendiente'}];const row={sourceId:'S1',claim:'A',page:'1',quote:'B',status:'Respaldada'};
test('cada sesión suma exactamente 240 minutos',()=>{for(const s of Object.values(sessions))assert.equal(s.blocks.reduce((n,b)=>n+b[1],0),240)});
test('rechaza fuentes desconocidas',()=>assert.throws(()=>importClaims([{...row,sourceId:'S99'}],sources),/desconocida/));
test('no confía en verificación importada',()=>assert.equal(importClaims([row],sources)[0].status,'Pendiente'));
test('conserva texto hostil como datos',()=>assert.equal(importClaims([{...row,claim:'<script>alert(1)</script>'}],sources)[0].claim,'<script>alert(1)</script>'));
test('respaldo valida esquema y restablece revisión',()=>{const v={...empty(),sources,claims:[row]};assert.equal(restore(JSON.parse(JSON.stringify(v))).claims[0].status,'Pendiente');assert.throws(()=>restore({...v,sources:[...sources,...sources]}),/duplicados/)});
test('csv protege fórmulas y comillas',()=>{assert.ok(csv([['=SUM(A1)','a"b']]).includes("'=SUM(A1)"));assert.ok(csv([['a"b']]).includes('a""b'))});
test('instrucción y plantilla conservan configuración sin inyección HTML',()=>{const s=empty();s.config.title='</script><script>alert(1)</script>';assert.ok(prompt(s).includes('No reportado'));assert.ok(!standalone(s.config).includes(s.config.title))});
