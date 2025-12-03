// js/auth.js

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user || {}));
}

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
