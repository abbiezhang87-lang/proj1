import api from './axios.js';

export const signInApi = (payload) => api.post('/auth/signin', payload);
export const signUpApi = (payload) => api.post('/auth/signup', payload);
export const meApi = () => api.get('/auth/me');

export const requestPasswordResetApi = (payload) =>
  api.post('/auth/password/request', payload || {});
export const confirmPasswordResetApi = ({ token, newPassword }) =>
  api.post('/auth/password/confirm', { token, newPassword });
