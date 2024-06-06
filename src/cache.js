// cache.js
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import globalCache from './globalCache';
import loadEventsFromGCS from './pages/api/loadEventsFromGCS';

const cacheLifetime = 72 * 60 * 60 * 1000; // 72 heures en millisecondes
const cacheUpdateInterval = cacheLifetime / 2; // 36 heures en millisecondes
const cacheDirPath = path.resolve('/mnt/wslg/distro/home/rvng64/code/RVNG64/dotfiles/wazaa-nextjs/cache');
const cacheFilePath = path.resolve('/mnt/wslg/distro/home/rvng64/code/RVNG64/dotfiles/wazaa-nextjs/cache/eventsCache.json');
const tempCacheFilePath = path.resolve('/mnt/wslg/distro/home/rvng64/code/RVNG64/dotfiles/wazaa-nextjs/cache/eventsCache.temp.json');

let cacheInitializationPromise = null;

async function loadCacheFromFile() {
  try {
    if (fsSync.existsSync(cacheFilePath)) {
      const cacheData = await fs.readFile(cacheFilePath, 'utf8');
      const parsedCache = JSON.parse(cacheData);
      if (parsedCache.lastCacheUpdate && parsedCache.eventsCache) {
        globalCache.eventsCache = parsedCache.eventsCache;
        globalCache.lastCacheUpdate = parsedCache.lastCacheUpdate;
      } else {
        throw new Error('lastCacheUpdate ou eventsCache est manquant dans le fichier de cache');
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du cache depuis le fichier:', error);
  }
}

async function saveCacheToFile() {
  try {
    if (!fsSync.existsSync(cacheDirPath)) {
      await fs.mkdir(cacheDirPath, { recursive: true });
    }

    const cacheData = {
      eventsCache: globalCache.eventsCache,
      lastCacheUpdate: globalCache.lastCacheUpdate,
    };

    await fs.writeFile(tempCacheFilePath, JSON.stringify(cacheData, null, 2));
    await fs.rename(tempCacheFilePath, cacheFilePath);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache dans le fichier:', error);
  }
}

async function initializeCache() {
  if (globalCache.cacheInitialized) {
    return;
  }

  if (cacheInitializationPromise) {
    await cacheInitializationPromise;
    return;
  }

  cacheInitializationPromise = (async () => {
    console.log('Initialisation du cache...');
    try {
      await loadCacheFromFile();
    } catch (error) {
      console.error('Erreur lors du chargement initial du cache:', error);
    }

    const currentTime = Date.now();
    if (!globalCache.eventsCache || (currentTime - globalCache.lastCacheUpdate) > cacheLifetime) {
      try {
        await updateCache();
      } catch (error) {
        console.error('Échec de l\'initialisation du cache:', error);
        throw new Error('Erreur lors de l\'initialisation du cache: ' + error.message);
      }
    }
    globalCache.cacheInitialized = true;
    console.log('Cache initialisé avec succès');
  })();

  await cacheInitializationPromise;
}

async function updateCache() {
  if (globalCache.isUpdatingCache) {
    return globalCache.updatePromise;
  }

  globalCache.isUpdatingCache = true;
  globalCache.updatePromise = (async () => {
    try {
      console.log('Mise à jour du cache...');
      const events = await loadEventsFromGCS();
      globalCache.eventsCache = events;
      globalCache.lastCacheUpdate = Date.now();
      await saveCacheToFile();
      console.log(`Cache mis à jour avec succès: lastCacheUpdate = ${globalCache.lastCacheUpdate}`);
    } catch (error) {
      console.error('Échec de la mise à jour du cache:', error);
    } finally {
      globalCache.isUpdatingCache = false;
      globalCache.updatePromise = null;
      console.log('Mise à jour du cache terminée. Nombre d\'événements:', globalCache.eventsCache?.length);
    }
  })();
  return globalCache.updatePromise;
}

async function checkAndUpdateCacheBackground() {
  const currentTime = Date.now();
  if ((currentTime - globalCache.lastCacheUpdate) > cacheLifetime && !globalCache.isUpdatingCache) {
    updateCache(); // Lancer la mise à jour en arrière-plan
  }
}

setInterval(async () => {
  await checkAndUpdateCacheBackground();
}, cacheUpdateInterval);

const getEventsCache = () => globalCache.eventsCache;

export { getEventsCache, initializeCache, checkAndUpdateCacheBackground };
