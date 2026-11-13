import {expedientes} from './expedientes.js';
const get=(s,k,opts)=>Number.isInteger(s?.[k])&&s[k]>=0&&s[k]<opts.length?s[k]:null;
export function caseRecord(id,s={}){
 const c=expedientes[id];if(!c)return null;
 const first=get(s,'first',c.o1),second=first!==null?get(s,'second',c.o2):null;
 return {first,second,note:typeof s?.note==='string'?s.note:''};
}
export function caseNotebook(id,raw){
 const c=expedientes[id],s=caseRecord(id,raw);if(!c||s.first===null)return '';
 return '\n### Expediente: '+c.title+' (caso ficticio)\n\n'+c.q1+'\nRespuesta inicial: '+c.o1[s.first]+'\n\n'+c.q2+'\nRespuesta tras la nueva evidencia: '+(s.second===null?'Pendiente':c.o2[s.second])+'\n\nTransferencia: '+(s.note||'Pendiente')+'\n';
}
export function mountCase(host,id,raw,onChange){
 const c=expedientes[id];if(!c||!host)return;
 const s=caseRecord(id,raw);
 function add(parent,tag,text){const el=document.createElement(tag);if(text)el.textContent=text;parent.append(el);return el}
 function render(focus){
 host.replaceChildren();const head=add(host,'h3',c.title);head.tabIndex=-1;
 add(host,'p','Expediente ficticio · Reserve unos 6 minutos del tiempo de práctica de esta unidad. Puede usar este caso como ensayo antes de trabajar con su corpus.');
 add(host,'p',c.opening);
 function round(n,k,opts,key,reason){
  const f=add(host,'fieldset');add(f,'legend',c['q'+n]);
  if(s[k]===null){for(const [i,t] of opts.entries()){const b=add(f,'button',t);b.type='button';b.className='secondary';b.onclick=()=>{s[k]=i;onChange({...s});render(k)}}}
  else{add(f,'p','Su decisión: '+opts[s[k]]);const p=add(f,'p',(s[k]===key?'Decisión sustentada. ':'Revise la inferencia. ')+reason);if(focus===k){p.tabIndex=-1;p.focus()}}
 }
 round(1,'first',c.o1,c.k1,c.r1);
 if(s.first!==null){add(host,'h4',c.turn);add(host,'p',c.evidence);round(2,'second',c.o2,c.k2,c.r2)}
 if(s.second!==null){const label=add(host,'label',c.transfer);const note=add(label,'textarea');note.value=s.note;note.oninput=()=>{s.note=note.value;onChange({...s})};add(host,'small','La decisión inicial, la revisión y esta nota se incluyen en la descarga del cuaderno.');}
 }render();
}
