import { resolveApiBaseUrl } from './baseUrl.js';

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const managingSchoolId = sessionStorage.getItem('managingSchoolId')
    || localStorage.getItem('managingSchoolId');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${resolveApiBaseUrl()}${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(role === 'SUPER_ADMIN' && managingSchoolId
        ? { 'X-Tenant-School-Id': managingSchoolId }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
};
