// src/utils/api.js
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';

// Configurez l'adaptateur de cache
const cache = setupCache({
  maxAge: 15 * 60 * 1000 // Cache les résultats pendant 15 minutes
});

// Créez une instance Axios avec l'adaptateur de cache
const api = axios.create({
  baseURL: 'https://www.wazaa.app', // 'https://www.wazaa.app ou 'http://localhost:3000'
  adapter: cache.adapter
});

// Intercepteur pour gérer les requêtes
api.interceptors.request.use(
  config => {
    // Log des détails de la requête
    console.log(`Making request to ${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export default api;
