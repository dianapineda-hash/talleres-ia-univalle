import test from 'node:test';
import assert from 'node:assert/strict';
import {courseProgress,reportHTML,studentCSV,csvCell,recordedSeconds} from './administracion.js';
import {safeNext} from './acceso.js';

test('separa actividades y pausa sin convertir respuestas en cumplimiento',()=>{
  const student={progress:[{course:1,unit:1,opened:true,answer:0,completed:false,seconds:90},{course:1,unit:2,answer:1,completed:true,explained:true,seconds:30},{course:1,unit:4,completed:true,seconds:600},{course:2,unit:1,seconds:999},{course:1,unit:8,seconds:999}]};
  const p=courseProgress(student,1);
  assert.equal(p.activitySeconds,120);assert.equal(p.pauseSeconds,600);assert.equal(p.totalSeconds,720);
  assert.equal(p.expectedMinutes,240);assert.equal(p.activityMinutes,225);assert.equal(p.pauseMinutes,15);
  assert.equal(p.exerciseCount,6);assert.equal(p.completed,1);assert.equal(p.answered,2);assert.equal(p.explained,1);
});
test('evita registrar respuestas inválidas y tiempos no numéricos',()=>{
  const p=courseProgress({progress:[{course:2,unit:1,answer:null,seconds:-10},{course:2,unit:2,answer:99,seconds:'200'},{course:2,unit:3,answer:0,seconds:15.9}]},2);
  assert.equal(p.answered,1);assert.equal(p.totalSeconds,15);assert.equal(recordedSeconds(Infinity),0);
});
test('el reporte incluye ambos talleres y escapa datos de cuenta',()=>{
  const html=reportHTML({name:'<img src=x onerror=alert(1)>',username:'a&b',active:true,progress:[]});
  assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));
  assert.equal((html.match(/class="report-course"/g)||[]).length,2);
  assert.equal((html.match(/class="unit-report"/g)||[]).length,14);
  assert.ok(html.includes('Sin respuesta registrada.'));
});
test('protege el CSV de fórmulas y conserva comillas',()=>{
  for(const value of ['=1+2',' +SUM(A1)','@SUM(A1)','-1','\t=1'])assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('a"b'),'"a""b"');
  const csv=studentCSV({name:'=1+1',username:'test',progress:[]});
  assert.ok(csv.includes('"\'=1+1"'));assert.equal(csv.split('\r\n').length,15);
});
test('retorno de ingreso restringido a páginas locales del aula',()=>{
  const origin='https://ia-hub-univalle.onrender.com';
  assert.equal(safeNext('/aula/taller-1.html#unidad-6',origin),'/aula/taller-1.html#unidad-6');
  for(const value of ['https://evil.example','//evil.example','/aula/../../private','/aula/\\evil','/aula/acceso.html','/aula/api/session','/otra-pagina',null])assert.equal(safeNext(value,origin),null);
});
test('conserva el apartado que el navegador hereda durante el ingreso',()=>{
  const origin='https://ia-hub-univalle.onrender.com';
  assert.equal(safeNext('/aula/taller-2.html',origin,'#unidad-5'),'/aula/taller-2.html#unidad-5');
  assert.equal(safeNext('/aula/taller-2.html#unidad-3',origin,'#unidad-5'),'/aula/taller-2.html#unidad-3');
  for(const fragment of ['#unidad-8','#unidad-01','#herramientas','#unidad-1?next=outside'])assert.equal(safeNext('/aula/taller-2.html',origin,fragment),'/aula/taller-2.html');
});
