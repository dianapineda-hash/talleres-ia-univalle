import {mkdir,copyFile,readdir,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const f of await readdir('.')) if(/\.(html|css|js)$/.test(f)&&!f.endsWith('.test.js')) await copyFile(f,'dist/'+f);
await copyFile('lessons.json','dist/lessons.json');
await cp('media','dist/media',{recursive:true});
