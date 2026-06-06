import type { AuthUser, LoginCredentials } from '../types/auth';

const authStorageKey = 'north-orders-admin-current-user';

const adminUser = {
  id: 'admin-1',
  login: 'admin',
  password: 'admin123',
  name: 'Администратор',
};

export function loadCurrentUser(): AuthUser | null {
  try {
    const savedUser = localStorage.getItem(authStorageKey);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: AuthUser) {
  localStorage.setItem(authStorageKey, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(authStorageKey);
}

export function loginWithDemoUser(credentials: LoginCredentials): AuthUser | null {
  const login = credentials.login.trim().toLowerCase();
  const password = credentials.password.trim();

  if (login !== adminUser.login || password !== adminUser.password) {
    return null;
  }

  return {
    id: adminUser.id,
    name: adminUser.name,
  };
}
