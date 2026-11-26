import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {contenido} from './aula-contenido.js';
import {unitHTML,resourcesHTML,headerHTML,footerHTML,courseProgress,activityIsActive,navigationHTML,completionHTML} from './aula.js';
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
test('el avance usa la cuenta y no incorpora archivos ni almacenamiento en el navegador',()=>{
 const source=fs.readFileSync('aula.js','utf8');
 assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|<input|<textarea|<form/);
 assert.match(source,/const API='\/aula\/api'/);assert.match(source,/credentials:'same-origin'/);
 assert.match(source,/request\('\/session'/);assert.match(source,/request\('\/progress'/);assert.match(source,/request\('\/pulse'/);
 assert.doesNotMatch(source,/import.*(?:learn|site|clone|lab|practice)\.js/);
 for(const path of ['index.html','taller-1.html','taller-2.html']){
  const html=fs.readFileSync(path,'utf8');assert.match(html,/aula\.js/);
  assert.doesNotMatch(html,/learn\.js|site\.js/);
 }
});
test('todas las unidades conservan acceso directo, sin requisitos de realización',()=>{
 for(const id of ['1','2']){
  const html=navigationHTML(id);
  for(let unit=1;unit<=7;unit++)assert.ok(html.includes('href="#unidad-'+unit+'"'));
  assert.doesNotMatch(html,/disabled|locked|aria-disabled/);
  assert.match(completionHTML(),/Todas las actividades permanecen disponibles/);
 }
});
test('el porcentaje académico no concede avance por abrir páginas ni por duración',()=>{
 const untouched=courseProgress('1',[{course:1,unit:1,opened:true,seconds:14400}]);
 assert.equal(untouched.completed,0);assert.equal(untouched.percent,0);
 const partial=courseProgress('1',[{course:1,unit:1,completed:true,answer:1},{course:1,unit:4,completed:true},{course:2,unit:2,completed:true}]);
 assert.equal(partial.total,6);assert.equal(partial.completed,1);assert.equal(partial.percent,17);assert.equal(partial.answered,1);assert.equal(partial.pauseCompleted,true);
 const full=courseProgress('2',[1,2,3,5,6,7].map(unit=>({course:2,unit,completed:true})));
 assert.equal(full.percent,100);assert.equal(full.pauseCompleted,false);
});
test('el pulso requiere actividad reciente en una pestaña visible y con foco',()=>{
 const state={visible:true,focused:true,idleMs:0};assert.equal(activityIsActive(state),true);
 for(const patch of [{visible:false},{focused:false},{onUnit:false},{idleMs:300000},{idleMs:NaN},{idleMs:-1}])assert.equal(activityIsActive({...state,...patch}),false);
 assert.equal(activityIsActive({...state,idleMs:299999}),true);
 const source=fs.readFileSync('aula.js','utf8');
 assert.match(source,/body:\{course:Number\(id\),unit,active:actualActive,tabId\}/);
 assert.doesNotMatch(source,/body:\{[^}]*seconds/);
 assert.doesNotMatch(source,/setInterval[^\n]*course-meter/);
 assert.doesNotMatch(source,/temporizador|cuenta regresiva|tiempo transcurrido|duración registrada:|totalSeconds/);
});
test('la cabecera respeta el rol y escapa los datos de la cuenta',()=>{
 assert.doesNotMatch(headerHTML({name:'<script>',username:'ana',role:'student'}),/href="administracion.html"|<script>/);
 assert.match(headerHTML({name:'Diana',username:'admin',role:'admin'}),/href="administracion.html"/);
 assert.match(footerHTML(),/no incluye fechas ni horarios/);
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
