/**
 * auth/users.js - Sistema de autenticación simple.
 * Usuarios hardcodeados; sesión guardada en sessionStorage.
 */
// Usuarios autorizados del sistema
export const USERS = [
  {
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'Administrador',
  },
  {
    username: 'porteria',
    password: 'porteria123',
    nombre: 'Portería',
    rol: 'Portería / Recepción',
  },
];

const KEY = 'sp_user';

export const login = (username, password) => {
  const u = USERS.find((x) => x.username === username && x.password === password);
  if (!u) return null;
  const safe = { username: u.username, nombre: u.nombre, rol: u.rol };
  sessionStorage.setItem(KEY, JSON.stringify(safe));
  return safe;
};

export const logout = () => sessionStorage.removeItem(KEY);

export const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
};

export const isAuthenticated = () => !!getUser();
