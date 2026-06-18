export const LOCAL_ADMIN_PASSWORD = 'passpass';
export const LEGACY_ADMIN_PASSWORD = 'admin2024';

export const LOCAL_TOKEN_VALUE = 'local-admin-token';

export function completeLocalLogin() {
  localStorage.setItem('cutportal_token', LOCAL_TOKEN_VALUE);
  localStorage.setItem('cutportal_user', JSON.stringify({
    id: 'local-admin',
    name: 'Admin',
    email: 'admin@cutportal.com',
    role: 'admin',
  }));
}

/** Returns true when signed in with the local dev-only fake token. */
export function isLocalSession() {
  return localStorage.getItem('cutportal_token') === LOCAL_TOKEN_VALUE;
}

export function canUseLocalLogin(password) {
  return import.meta.env.DEV && (password === LOCAL_ADMIN_PASSWORD || password === LEGACY_ADMIN_PASSWORD);
}

export function isAuthenticated() {
  try {
    const token = localStorage.getItem('cutportal_token');
    const userStr = localStorage.getItem('cutportal_user');
    if (!token || !userStr) return false;
    const user = JSON.parse(userStr);
    return user && user.role === 'admin';
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem('cutportal_token');
  localStorage.removeItem('cutportal_user');
}
