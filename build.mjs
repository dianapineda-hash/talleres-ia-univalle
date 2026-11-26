import {mkdir,writeFile,rm,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const base=path.dirname(fileURLToPath(import.meta.url));
const output=path.resolve(base,'dist');
if(path.dirname(output)!==base||path.basename(output)!=='dist')throw new Error('Ruta de publicación inválida.');
try{if((await lstat(output)).isSymbolicLink())throw new Error('La salida no puede ser un enlace.');}catch(e){if(e.code!=='ENOENT')throw e;}
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const destination='https://aula-ia-univalle.onrender.com/aula/';
function gateway(target){return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${target}"><title>Ingreso a los talleres · IA Hub</title><style>body{font:18px/1.6 Arial,sans-serif;max-width:760px;margin:12vh auto;padding:24px;color:#333}h1{color:#c20e1a}a{color:#791018}</style></head><body><h1>Ingreso a los talleres</h1><p>Los talleres se encuentran en el aula de IA Hub. Ingrese con su usuario para conservar el desarrollo de las actividades.</p><p><a href="${target}">Entrar al aula</a></p></body></html>`;}
for(const file of ['index.html','taller-1.html','taller-2.html','acceso.html','administracion.html'])await writeFile(path.join(output,file),gateway(destination+file));
await writeFile(path.join(output,'404.html'),gateway(destination+'index.html'));
console.log('Publicación de acceso preparada. El contenido de los talleres se sirve desde el aula protegida de IA Hub.');
