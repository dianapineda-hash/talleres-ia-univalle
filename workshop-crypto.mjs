import crypto from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(crypto.scrypt);
export async function passwordRecord(password){
 if(typeof password!=='string'||password.length<12||password.length>128)throw Object.assign(new Error('Use una contraseña de entre 12 y 128 caracteres. Puede emplear una frase.'),{status:400});
 const salt=crypto.randomBytes(32).toString('hex');
 return {salt,hash:(await scrypt(password,salt,64)).toString('hex')};
}
export async function passwordMatches(password,user){
 const value=String(password||'');if(value.length>128)return false;
 const derived=await scrypt(value,user?.salt||'aula-invalid-account',64);
 const expected=Buffer.from(user?.hash||'0'.repeat(128),'hex');
 return expected.length===derived.length&&crypto.timingSafeEqual(derived,expected);
}
