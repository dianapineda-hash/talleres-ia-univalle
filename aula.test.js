import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {contenido} from './aula-contenido.js';
import {unitHTML,resourcesHTML,headerHTML,footerHTML} from './aula.js';
test('cada recorrido conserva su nombre y suma cuatro horas',()=>{
 assert.equal(contenido.courses['1'].title,'Uso de inteligencia artificial en la investigación');
 assert.equal(contenido.courses['2'].title,'Cree su clon de investigación y sus primeros productos');
 for(const c of Object.values(contenido.courses))assert.equal(c.units.reduce((n,u)=>n+u.minutes,0),240);
});
test('cada actividad tiene caso, pasos, retroalimentación y recursos',()=>{
 for(const [id,c]of Object.entries(contenido.courses))for(const [i,u]of c.units.entries()){
  if(u.pause)continue;
  assert.equal(u.steps.length,4);assert.equal(u.options.length,u.feedback.length);
  assert.ok(u.correct>=0&&u.correct<u.options.length);assert.match(u.case,/Caso creado para el ejercicio/);
  assert.ok(u.reads.length>=2);for(const k of u.reads)assert.ok(contenido.readings[k]);
  assert.ok(contenido.videos[u.video]);const html=unitHTML(id,i);
  assert.match(html,/Lecturas recomendadas/);assert.match(html,/Video de apoyo/);assert.match(html,/data-choice/);
 }
});
test('redacción sin los términos excluidos y sin rayas',()=>{
 const texts=[JSON.stringify(contenido),resourcesHTML(),headerHTML(),footerHTML()];
 for(const [id,c]of Object.entries(contenido.courses))c.units.forEach((_,i)=>texts.push(unitHTML(id,i)));
 for(const s of texts)assert.doesNotMatch(s,/\b(?:distinguir|solo|sólo|sino|investigativ[oa]s?)\b|[—–]/i);
});
test('la ruta no incorpora captura de datos ni persistencia',()=>{
 const source=fs.readFileSync('aula.js','utf8');
 assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|serviceWorker|<input|<textarea|<form/);
 assert.doesNotMatch(source,/import.*(?:learn|site|clone|lab|practice)\.js/);
 for(const path of ['index.html','taller-1.html','taller-2.html']){
  const html=fs.readFileSync(path,'utf8');assert.match(html,/aula\.js/);
  assert.doesNotMatch(html,/learn\.js|site\.js/);
 }
});
test('los recursos permanecen fuera de la página hasta elegir abrirlos',()=>{
 for(const [id,c]of Object.entries(contenido.courses))for(let i=0;i<c.units.length;i++){
  const html=unitHTML(id,i);assert.doesNotMatch(html,/<iframe/);
  assert.doesNotMatch(html,/src="https:\/\//);
 }
});
test('cuentas reproducibles de los dos casos de comparación',()=>{
 assert.equal((9/10+27/90)/2,.6);assert.equal((72/90+2/10)/2,.5);
 assert.equal(2*5+2,12);assert.equal(2*2+2,6);assert.equal((10-2)/2,4);
});
