// scripts/preloadCache.js
require('dotenv').config();
const { initializeCache } = require('../src/cache');

(async () => {
  try {
    await initializeCache(true);
    console.log('Cache pré-chargé avec succès.');
  } catch (error) {
    console.error('Erreur lors du pré-chargement du cache:', error);
  }
})();
