export const LOCAL_ADMIN_PASSWORD = 'password123';
export const LEGACY_ADMIN_PASSWORD = 'admin2024';

export function completeLocalLogin() {
  localStorage.setItem('voidstore_token', 'local-admin-token');
  localStorage.setItem('voidstore_user', JSON.stringify({
    id: 'local-admin',
    name: 'Admin',
    email: 'admin@voidstore.com',
    role: 'admin',
  }));
}

export function canUseLocalLogin(password) {
  return password === LOCAL_ADMIN_PASSWORD || password === LEGACY_ADMIN_PASSWORD;
}

export function isAuthenticated() {
  try {
    const token = localStorage.getItem('voidstore_token');
    const userStr = localStorage.getItem('voidstore_user');
    if (!token || !userStr) return false;
    const user = JSON.parse(userStr);
    return user && user.role === 'admin';
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem('voidstore_token');
  localStorage.removeItem('voidstore_user');
}
