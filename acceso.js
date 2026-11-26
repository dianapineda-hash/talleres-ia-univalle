const API_BASE = '/aula/api';

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function safeNext(value, origin, fragment = '') {
  if (typeof value !== 'string' || !value.startsWith('/aula/') || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || !url.pathname.startsWith('/aula/')) return null;
    if (/\/(?:acceso\.html|api)(?:\/|$)/i.test(url.pathname)) return null;
    const hash = url.hash || (/^#unidad-[1-7]$/.test(fragment) ? fragment : '');
    return url.pathname + url.search + hash;
  } catch { return null; }
}

export async function apiRequest(path, {method = 'GET', body} = {}) {
  const response = await fetch(API_BASE + path, {
    method, credentials: 'same-origin', cache: 'no-store',
    headers: body === undefined ? {'Accept':'application/json'} : {'Accept':'application/json','Content-Type':'application/json'},
    ...(body === undefined ? {} : {body:JSON.stringify(body)})
  });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const error = new Error('No fue posible completar la solicitud.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

async function startAccess() {
  const status = document.querySelector('#access-status');
  const loginPanel = document.querySelector('#login-panel');
  const passwordPanel = document.querySelector('#password-panel');
  const title = document.querySelector('#access-title');
  const intro = document.querySelector('#access-intro');
  const next = safeNext(new URLSearchParams(location.search).get('next'), location.origin, location.hash);
  const passwordRequested = new URLSearchParams(location.search).get('password') === '1';
  let currentUser = null;
  const message = (text, error = false) => { status.textContent = text; status.classList.toggle('error', error); };
  const destination = user => next || (user.role === 'admin' ? '/aula/administracion.html' : '/aula/index.html');
  function showLogin() {
    currentUser = null; loginPanel.hidden = false; passwordPanel.hidden = true;
    title.textContent = 'Ingrese al aula';
    intro.textContent = 'Utilice el usuario y la contraseña que recibió de la administración del aula.';
  }
  function accept(user) {
    currentUser = user;
    if (user.mustChangePassword || passwordRequested) {
      loginPanel.hidden = true; passwordPanel.hidden = false;
      title.textContent = 'Cambie su contraseña';
      intro.textContent = user.mustChangePassword ? 'Antes de continuar, reemplace la contraseña temporal que recibió.' : 'Escriba la contraseña actual y elija una nueva.';
      message('');
      document.querySelector('#current-password').focus();
    } else location.replace(destination(user));
  }
  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget, submit = form.querySelector('button');
    submit.disabled = true; message('Comprobando el acceso…');
    try {
      const {user} = await apiRequest('/login', {method:'POST', body:{username:form.username.value.trim(),password:form.password.value}});
      form.password.value = '';
      if (!user) throw new Error();
      accept(user);
    } catch (error) {
      form.password.value = '';
      message(error.status === 429 ? 'Espere un momento antes de intentar de nuevo.' : 'No fue posible ingresar. Revise sus datos o contacte a la administración del aula.', true);
    } finally { submit.disabled = false; }
  });
  document.querySelector('#password-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget, submit = form.querySelector('button');
    const password = document.querySelector('#new-password').value;
    if (password !== document.querySelector('#repeat-password').value) { message('Las contraseñas nuevas deben coincidir.', true); return; }
    submit.disabled = true; message('Guardando la contraseña…');
    try {
      await apiRequest('/password', {method:'POST', body:{current:document.querySelector('#current-password').value,password}});
      form.reset();
      location.replace(destination(currentUser));
    } catch (error) {
      if (error.status === 401) { showLogin(); message('Ingrese de nuevo para continuar.', true); }
      else message('No fue posible cambiar la contraseña. Revise la contraseña actual y use una nueva de al menos 12 caracteres.', true);
    } finally { submit.disabled = false; }
  });
  document.querySelector('#access-logout').addEventListener('click', async () => {
    try { await apiRequest('/logout', {method:'POST',body:{}}); location.replace('/aula/acceso.html'); }
    catch { message('No fue posible cerrar la sesión. Intente de nuevo.', true); }
  });
  try {
    const {user} = await apiRequest('/session');
    if (user) accept(user); else { showLogin(); message(''); }
  } catch { showLogin(); message('No se pudo comprobar la sesión. Puede intentar ingresar.', true); }
}

if (typeof document !== 'undefined' && document.body.dataset.page === 'access') startAccess();
