import axios from 'axios';
import { resolveApiBaseUrl } from './baseUrl.js';

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const role = localStorage.getItem('role');
  const managingSchoolId = sessionStorage.getItem('managingSchoolId')
    || localStorage.getItem('managingSchoolId');
  if (role === 'SUPER_ADMIN' && managingSchoolId) {
    config.headers['X-Tenant-School-Id'] = managingSchoolId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isLoginAttempt = url.includes('/auth/session');
    if (err.response?.status === 401 && !isLoginAttempt) {
      const hadToken = localStorage.getItem('token');
      const onLoginPage = window.location.pathname === '/login';
      if (hadToken && !onLoginPage) {
        localStorage.clear();
        sessionStorage.removeItem('managingSchoolId');
        sessionStorage.removeItem('managingSchoolName');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
