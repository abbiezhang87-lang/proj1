import api from './axios.js';

/**
 * Thin wrappers around /api/auth endpoints. All async thunks in
 * features/auth/authSlice.js call through these.
 */
export const signInApi = (payload) => api.post('/auth/signin', payload);
export const signUpApi = (payload) => api.post('/auth/signup', payload);
export const updatePasswordApi = (payload) =>
  api.put('/auth/password', payload);
export const meApi = () => api.get('/auth/me');
