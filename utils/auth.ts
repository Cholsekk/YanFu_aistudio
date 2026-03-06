
export const CONSOLE_TENANT_ID_KEY = 'console_tenant_id';
export const CONSOLE_TOKEN_KEY = 'console_token';

export const getTenantId = (): string | null => {
  return localStorage.getItem(CONSOLE_TENANT_ID_KEY);
};

export const setTenantId = (tenantId: string): void => {
  localStorage.setItem(CONSOLE_TENANT_ID_KEY, tenantId);
};

export const getToken = (): string | null => {
  return localStorage.getItem(CONSOLE_TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(CONSOLE_TOKEN_KEY, token);
};
