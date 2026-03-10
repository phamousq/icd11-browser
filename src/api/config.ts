export const CONFIG = {
  apiBaseUrl: 'https://id.who.int/icd',
  authUrl: 'https://icdaccessmanagement.who.int/connect/token',
  clientId: import.meta.env.VITE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_CLIENT_SECRET || '',
  releaseVersion: '2026-01',
  apiVersion: 'v2',
  releaseId: 'release/11',
  defaultLanguage: 'en',
};
