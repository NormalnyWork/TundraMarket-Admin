import type { AuthUser, LoginCredentials } from '../types/auth';
import { apiRequest } from './apiClient';

const authStorageKey = 'north-orders-admin-current-user';

type AdminAuthResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: {
    id?: string | number;
    name?: string;
    login?: string;
  };
};

export function loadCurrentUser(): AuthUser | null {
  try {
    const savedUser = localStorage.getItem(authStorageKey);
    const user = savedUser ? (JSON.parse(savedUser) as Partial<AuthUser>) : null;

    if (user?.token) {
      return {
        id: String(user.id ?? 'admin'),
        name: user.name ?? 'Администратор',
        token: user.token,
      };
    }

    return null;
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

export async function loginAdmin(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiRequest<AdminAuthResponse>('/admin/auth', {
    method: 'POST',
    body: {
      login: credentials.login.trim(),
      password: credentials.password,
    },
  });
  const token = response.token ?? response.accessToken ?? response.access_token;

  if (!token) {
    throw new Error('Admin auth response does not include token');
  }

  return {
    id: String(response.user?.id ?? 'admin'),
    name: response.user?.name ?? response.user?.login ?? 'Администратор',
    token,
  };
}
