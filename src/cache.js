// src/cache.js
import fs from 'fs/promises';
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
async function loadCacheFromFile() {
  try {
    await fs.access(cacheFilePath);
    const cacheData = await fs.readFile(cacheFilePath, 'utf8');
    const parsedCache = JSON.parse(cacheData);
    eventsCache = parsedCache.eventsCache;
    lastCacheUpdate = parsedCache.lastCacheUpdate;
    global.eventsCache = eventsCache;
    global.lastCacheUpdate = lastCacheUpdate;
    console.log('Cache chargé depuis le fichier.');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Le fichier de cache n\'existe pas.');
    } else {
      console.error('Erreur lors du chargement du cache depuis le fichier:', error);
    }
  }
}

// Enregistrement du cache dans un fichier
async function saveCacheToFile() {
  try {
    const cacheData = {
      eventsCache,
      lastCacheUpdate,
    };
    await fs.writeFile(cacheFilePath, JSON.stringify(cacheData));
    console.log('Cache sauvegardé dans le fichier.');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache dans le fichier:', error);
  }
}

// Initialisation du cache
async function initializeCache() {
  await loadCacheFromFile();

  const currentTime = Date.now();
  if (!eventsCache || (currentTime - lastCacheUpdate) > cacheLifetime) {
    try {
      console.log('Cache non initialisé ou périmé, initialisation...');
      eventsCache = await loadEventsFromGCS();
      lastCacheUpdate = currentTime;
      global.eventsCache = eventsCache;
      global.lastCacheUpdate = lastCacheUpdate;
      await saveCacheToFile();
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
      await saveCacheToFile();
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
