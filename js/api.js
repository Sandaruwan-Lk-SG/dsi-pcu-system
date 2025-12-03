// js/api.js
// ⚠️ මෙහි BASE URL එක දාන්න ඔය backend එක (Railway URL එක)
const BASE = 'dsi-pcu-system-production.up.railway.app';

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const upper = (opts.method || 'GET').toUpperCase();

  if (upper !== 'GET' && !opts.body instanceof FormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(BASE + path, { ...opts, method: upper, headers });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) {}

  if (!res.ok) {
    const msg = json?.error || json?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.response = res;
    err.body = json;
    throw err;
  }
  return json;
}

function apiGet(path)        { return request(path, { method: 'GET'  }); }
function apiPost(path, body) { return request(path, { method: 'POST', body: JSON.stringify(body) }); }
function apiPut(path, body)  { return request(path, { method: 'PUT',  body: JSON.stringify(body) }); }
function apiDelete(path)     { return request(path, { method: 'DELETE' }); }
