// src/cache.js
import fs from 'fs';
import path from 'path';
import loadEventsFromGCS from './pages/api/loadEventsFromGCS';

const cacheLifetime = 72 * 60 * 60 * 1000; // 72 heures en millisecondes
const cacheFilePath = path.join(__dirname, 'eventsCache.json');

// Utiliser les variables globales pour stocker le cache
global.eventsCache = global.eventsCache || null;
global.lastCacheUpdate = global.lastCacheUpdate || 0;

// Variables locales pour l'exportation
let eventsCache = global.eventsCache;
let lastCacheUpdate = global.lastCacheUpdate;

// Chargement du cache depuis un fichier
function loadCacheFromFile() {
  if (fs.existsSync(cacheFilePath)) {
    const cacheData = fs.readFileSync(cacheFilePath);
    const parsedCache = JSON.parse(cacheData);
    eventsCache = parsedCache.eventsCache;
    lastCacheUpdate = parsedCache.lastCacheUpdate;
    global.eventsCache = eventsCache;
    global.lastCacheUpdate = lastCacheUpdate;
    console.log('Cache chargé depuis le fichier.');
  } else {
    console.log('Le fichier de cache n\'existe pas.');
  }
}

// Enregistrement du cache dans un fichier
function saveCacheToFile() {
  const cacheData = {
    eventsCache,
    lastCacheUpdate,
  };
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
  console.log('Cache sauvegardé dans le fichier.');
}

// Initialisation du cache
async function initializeCache() {
  loadCacheFromFile();

  const currentTime = Date.now();
  if (!eventsCache || (currentTime - lastCacheUpdate) > cacheLifetime) {
    try {
      console.log('Cache non initialisé ou périmé, initialisation...');
      eventsCache = await loadEventsFromGCS();
      lastCacheUpdate = currentTime;
      global.eventsCache = eventsCache;
      global.lastCacheUpdate = lastCacheUpdate;
      saveCacheToFile(); // Save to file
      console.log('Cache initialisé avec succès.');
    } catch (error) {
      console.error('Échec de l\'initialisation du cache:', error);
      throw new Error('Erreur lors de l\'initialisation du cache');
    }
  } else {
    console.log('Le cache est valide.');
  }
}

// Vérification et mise à jour du cache
async function checkAndUpdateCache() {
  const currentTime = Date.now();
  if ((currentTime - lastCacheUpdate) > cacheLifetime) {
    try {
      console.log('Le cache est périmé, mise à jour...');
      eventsCache = await loadEventsFromGCS();
      lastCacheUpdate = currentTime;
      global.eventsCache = eventsCache;
      global.lastCacheUpdate = lastCacheUpdate;
      saveCacheToFile(); // Save to file
      console.log('Cache mis à jour avec succès.');
    } catch (error) {
      console.error('Échec de la mise à jour du cache:', error);
    }
  }
}

// Initialisation immédiate du cache à l'importation du module
initializeCache().catch(error => {
  console.error('Erreur lors de l\'initialisation du cache:', error);
});

export { eventsCache, checkAndUpdateCache, initializeCache };
