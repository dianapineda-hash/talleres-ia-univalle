import './site.js';
import {download} from './site.js';
import {exampleProfile} from './example-data.js';
import {fields,productFields,checks,emptyProfile,normalizeProfile,masterPrompt,score,portable,escapeHTML as e} from './clone-core.js';
let profile=emptyProfile();const key='iahub-clon-v1';let recovered=false;
try{const value=localStorage.getItem(key);if(value){profile=normalizeProfile(JSON.parse(value));recovered=true;}}catch{}
const $=s=>document.querySelector(s);
$('#profile-form').addEventListener('submit',event=>event.preventDefault());
$('#test-list').innerHTML=checks.map((c,i)=>`<details><summary>${i+1}. ${c[0]}</summary><p>${c[1]}</p><p><strong>Esperado:</strong> ${c[2]}</p><label for="test-${i}">Resultado registrado por usted</label><select id="test-${i}" data-test="${i}"><option value="pendiente">Pendiente</option><option value="supera">Supera el caso</option><option value="falla">Falla; requiere ajuste</option></select><label for="note-${i}">Evidencia, observado, decisión y versión</label><textarea id="note-${i}" data-note="${i}" placeholder="Fecha y versión; respuesta observada; pasaje o evidencia; decisión y corrección."></textarea></details>`).join('');
function render(){for(const [k] of fields)$('#'+k).value=profile[k];for(const [k] of productFields)$('#product-'+k).value=profile.products[k];profile.tests.forEach((t,i)=>{$('#test-'+i).value=t.status;$('#note-'+i).value=t.note});refresh();}
function refresh(){ $('#master-prompt').textContent=masterPrompt(profile);const s=score(profile);$('#test-score').textContent=`${s.pass} de ${s.run} pruebas ejecutadas con evidencia se declaran superadas. ${s.fail} fallan. ${s.pending} pendientes. Un estado sin nota no cuenta como prueba ejecutada.`;}
function save(){try{localStorage.setItem(key,JSON.stringify(profile));$('#save-state').textContent='Borrador guardado en este navegador. Descargue el expediente para conservar otra copia.';}catch{$('#save-state').textContent='No se pudo guardar localmente. Descargue el expediente antes de salir.';}refresh();}
for(const [k] of fields)$('#'+k).addEventListener('input',event=>{profile[k]=event.target.value;profile.tests.forEach((t,i)=>{if(t.status!=='pendiente'){t.status='pendiente';t.note='Configuración modificada; repetir prueba. '+t.note;$('#test-'+i).value='pendiente';$('#note-'+i).value=t.note;}});save()});
for(const [k] of productFields)$('#product-'+k).addEventListener('input',event=>{profile.products[k]=event.target.value;save()});
document.querySelectorAll('[data-test]').forEach(s=>s.onchange=()=>{profile.tests[+s.dataset.test].status=s.value;save()});
document.querySelectorAll('[data-note]').forEach(s=>s.oninput=()=>{profile.tests[+s.dataset.note].note=s.value;save()});
$('#copy-master').onclick=async()=>{try{await navigator.clipboard.writeText(masterPrompt(profile));$('#copy-state').textContent='Instrucción copiada. Péguela en el cuaderno elegido.';}catch{$('#copy-state').textContent='Seleccione la instrucción y use Copiar en su navegador.';}};
$('#export-json').onclick=()=>download('expediente-clon.json',JSON.stringify(profile,null,2),'application/json');
$('#export-html').onclick=()=>download('ficha-clon-investigacion.html',portable(profile),'text/html;charset=utf-8');
$('#print-clone').onclick=()=>{document.querySelectorAll('details').forEach(d=>d.open=true);window.print()};
$('#restore-profile').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>500000)throw Error('El archivo excede el tamaño admitido.');const p=normalizeProfile(JSON.parse(await file.text()));p.tests=p.tests.map(t=>({status:'pendiente',note:t.note?'Registro importado, requiere nueva revisión: '+t.note:''}));profile=p;render();save();$('#restore-state').textContent='Expediente recuperado. Revise de nuevo las pruebas importadas.';}catch(err){$('#restore-state').textContent=err.message||'No se pudo leer el expediente. El borrador se conserva.';}event.target.value='';};
function loadExample(){profile=exampleProfile();render();save();$('#replace-example').hidden=true;$('#example-state').textContent='Perfil completo cargado. Ahora abra la guía del ejemplo, descargue S1–S3 y añádalas a su cuaderno de Google. Las pruebas y los productos están vacíos para que registre su trabajo real.';}
$('#example').onclick=()=>{if(profile.question.trim()||profile.sources.trim()||profile.products.matrix.trim()||profile.products.report.trim()||profile.tests.some(t=>t.note.trim())){$('#example-state').textContent='Ya hay trabajo en este borrador. Puede conservarlo y leer el ejemplo en otra pestaña, o descargar un respaldo y reemplazarlo con el botón siguiente.';$('#replace-example').hidden=false;return;}loadExample()};
$('#replace-example').onclick=()=>{download('respaldo-antes-del-ejemplo.json',JSON.stringify(profile,null,2),'application/json');loadExample()};

render();$('#save-state').textContent=recovered?'Borrador recuperado de este navegador.':'Complete su perfil para generar la instrucción.';
