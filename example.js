import {download} from './site.js';
import {fields,escapeHTML as e} from './clone-core.js';
import {sources,hostileSource,exampleProfile,prompts,testCases,matrixRows,matrixHeaders,workedReport,csvMatrix} from './example-data.js';
const $=s=>document.querySelector(s);
$('#example-sources').innerHTML=sources.map(s=>`<article class="source-card"><h3>${e(s.title)}</h3><details><summary>Leer el texto completo de ${s.id}</summary><pre>${e(s.text)}</pre></details><button class="secondary" data-download-source="${s.id}">Descargar ${s.id} TXT</button> <button class="secondary" data-copy-source="${s.id}">Copiar ${s.id} completo</button><p class="copy-feedback" role="status"></p></article>`).join('');
const profile=exampleProfile();$('#example-profile').innerHTML=fields.map(([key,label])=>`<dt>${e(label)}</dt><dd>${e(profile[key]).replaceAll('\n','<br>')}</dd>`).join('');
document.querySelectorAll('[data-prompt]').forEach(el=>{const id=el.dataset.prompt;el.innerHTML=`<div class="prompt-card"><h4>Copie esta consulta en el chat</h4><pre>${e(prompts[id])}</pre><button class="secondary" data-copy-prompt="${id}">Copiar consulta</button><p class="copy-feedback" role="status"></p></div>`});
$('#worked-matrix').innerHTML=`<caption>Modelo didáctico · Solo datos sintéticos</caption><thead><tr>${matrixHeaders.map(x=>`<th scope="col">${e(x)}</th>`).join('')}</tr></thead><tbody>${matrixRows.map(r=>`<tr>${r.map(x=>`<td>${e(x)}</td>`).join('')}</tr>`).join('')}</tbody>`;
$('#worked-report').innerHTML=workedReport.split('\n\n').map(x=>`<p>${e(x)}</p>`).join('');
$('#example-tests').innerHTML=testCases.map((t,i)=>`<details class="test-case"><summary>${i+1}. ${e(t.title)}</summary>${i===4?'<p><strong>Antes de consultar:</strong> añada y seleccione S4, disponible debajo de las seis pruebas.</p>':''}<pre>${e(t.prompt)}</pre><button class="secondary" data-copy-test="${i}">Copiar consulta de prueba ${i+1}</button><p class="copy-feedback" role="status"></p><p><strong>Qué debe comprobar:</strong> ${e(t.expected)}</p></details>`).join('');
$('#hostile-source').textContent=hostileSource.text;
async function copy(button,text){const scope=button.closest('.source-card,.prompt-card,.test-case');const feedback=scope?.querySelector('.copy-feedback')||$('#example-feedback');try{await navigator.clipboard.writeText(text);feedback.textContent='Texto copiado. Péguelo en el lugar indicado en este paso.';}catch{feedback.textContent='No se pudo copiar automáticamente. Abra el texto, selecciónelo y use Copiar en su navegador.';}}
document.querySelectorAll('[data-copy-source]').forEach(b=>b.onclick=()=>copy(b,[...sources,hostileSource].find(s=>s.id===b.dataset.copySource).text));
document.querySelectorAll('[data-download-source]').forEach(b=>b.onclick=()=>{const s=sources.find(s=>s.id===b.dataset.downloadSource);download(s.file,s.text,'text/plain;charset=utf-8')});
document.querySelectorAll('[data-copy-prompt]').forEach(b=>b.onclick=()=>copy(b,prompts[b.dataset.copyPrompt]));
document.querySelectorAll('[data-copy-test]').forEach(b=>b.onclick=()=>copy(b,testCases[+b.dataset.copyTest].prompt));
$('#download-hostile').onclick=()=>download(hostileSource.file,hostileSource.text,'text/plain;charset=utf-8');
$('#download-matrix').onclick=()=>download('matriz-modelo-sintetico.csv',csvMatrix(),'text/csv;charset=utf-8');
$('#download-report').onclick=()=>download('informe-modelo-sintetico.txt',workedReport,'text/plain;charset=utf-8');
