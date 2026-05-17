/** Single source of truth for the Express REST API base (includes /api/v1). */
export const resolveApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:3003').replace(/\/$/, '');
  if (raw.endsWith('/api/v1')) return raw;
  return `${raw}/api/v1`;
};
