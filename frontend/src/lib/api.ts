import { getToken, logout } from './auth';

const API_URL = import.meta.env.VITE_API_URL || '';
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  if (options.data) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.data);
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

    // Parse JSON
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token
        logout();

        // Do not redirect if it's the login endpoint or we are already on signin
        if (endpoint !== '/api/auth/login' && window.location.pathname !== '/signin') {
          window.location.href = '/signin';
        }
      }

      let errorMessage = responseData?.detail || responseData?.message || responseData?.error;

      // FastAPI validation error (detail is an array)
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.map((err: any) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
          return `Field "${field}" ${err.msg}`;
        }).join(', ');
      }

      if (!errorMessage) {
        if (endpoint === '/api/auth/login' && response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else {
          errorMessage = response.statusText || 'An error occurred';
        }
      }

      throw new Error(errorMessage);
    }

    return responseData;
}
