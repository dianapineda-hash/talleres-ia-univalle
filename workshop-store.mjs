import {neon} from '@neondatabase/serverless';
import fs from 'node:fs/promises';

const userColumns='id, username, name, role, active, must_change_password AS "mustChangePassword", salt, hash, version';
const publicColumns='id, username, name, role, active, must_change_password AS "mustChangePassword", version';
const progressColumns='course, unit, opened, answer, explained, completed, seconds';
const userChanges={active:'active',mustChangePassword:'must_change_password',salt:'salt',hash:'hash',version:'version'};
const progressChanges={opened:'opened',answer:'answer',explained:'explained',completed:'completed'};

export class WorkshopStore {
 constructor(connectionString,{query}={}) {
  if(!query&&!connectionString)throw new Error('Falta la conexión del aula.');
  this.sql=query||neon(connectionString);
 }
 async migrate() {
  const source=await fs.readFile(new URL('./migrations/001-workshops.sql',import.meta.url),'utf8');
  const statements=source.split(';').map(s=>s.trim()).filter(Boolean);
  await this.sql.transaction(statements.map(s=>this.sql.query(s,[])));
 }
 async ready(){await this.sql.query('SELECT id FROM workshop_users LIMIT 1',[]);}
 async findUser(username){return (await this.sql.query(`SELECT ${userColumns} FROM workshop_users WHERE username=$1`,[String(username).trim().toLowerCase()]))[0]||null;}
 async userById(id){return (await this.sql.query(`SELECT ${userColumns} FROM workshop_users WHERE id=$1`,[id]))[0]||null;}
 async listStudents(){return this.sql.query(`SELECT ${publicColumns} FROM workshop_users WHERE role='student' ORDER BY lower(name), username`,[]);}
 async createUser(record){
  const {id,username,name,role='student',active=true,mustChangePassword=true,salt,hash,version=1}=record;
  try{return (await this.sql.query(`INSERT INTO workshop_users(id,username,name,role,active,must_change_password,salt,hash,version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${userColumns}`,[id,username,name,role,active,mustChangePassword,salt,hash,version]))[0];}
  catch(e){if(e.code==='23505')throw Object.assign(new Error('Ese nombre de usuario ya está registrado.'),{status:409});throw e;}
 }
 async updateUser(id,patch){
  const keys=Object.keys(patch);if(!keys.length||keys.some(k=>!Object.hasOwn(userChanges,k)))throw new Error('Cambio de cuenta no permitido.');
  const sets=keys.map((k,i)=>`${userChanges[k]}=$${i+2}`).join(', ');
  return (await this.sql.query(`UPDATE workshop_users SET ${sets} WHERE id=$1 RETURNING ${userColumns}`,[id,...keys.map(k=>patch[k])]))[0]||null;
 }
 async progress(userId){return this.sql.query(`SELECT ${progressColumns} FROM workshop_progress WHERE user_id=$1 ORDER BY course, unit`,[userId]);}
 async saveProgress(userId,course,unit,patch){
  const keys=Object.keys(patch);if(!keys.length||keys.some(k=>!Object.hasOwn(progressChanges,k)))throw new Error('Cambio de avance no permitido.');
  const cols=keys.map(k=>progressChanges[k]);
  const params=keys.map((_,i)=>`$${i+4}`);
  const updates=cols.map(c=>`${c}=EXCLUDED.${c}`).join(', ');
  const rows=await this.sql.query(`INSERT INTO workshop_progress(user_id,course,unit,${cols.join(',')}) VALUES($1,$2,$3,${params.join(',')}) ON CONFLICT(user_id,course,unit) DO UPDATE SET ${updates} RETURNING ${progressColumns}`,[userId,course,unit,...keys.map(k=>patch[k])]);
  return rows[0];
 }
 async addSeconds(userId,course,unit,seconds){
  if(!Number.isFinite(seconds)||seconds<0||seconds>45)throw new Error('Intervalo no permitido.');
  return (await this.sql.query(`INSERT INTO workshop_progress(user_id,course,unit,opened,seconds) VALUES($1,$2,$3,true,$4) ON CONFLICT(user_id,course,unit) DO UPDATE SET opened=true, seconds=workshop_progress.seconds+EXCLUDED.seconds RETURNING ${progressColumns}`,[userId,course,unit,seconds]))[0];
 }
}
