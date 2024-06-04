import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import globalCache from './globalCache';
import loadEventsFromGCS from './pages/api/loadEventsFromGCS';

const cacheLifetime = 72 * 60 * 60 * 1000; // 72 heures en millisecondes
const cacheDirPath = path.resolve(__dirname, '../../cache');
const cacheFilePath = path.resolve('/mnt/wslg/distro/home/rvng64/code/RVNG64/dotfiles/wazaa-nextjs/cache/eventsCache.json');
const tempCacheFilePath = path.join(cacheDirPath, 'eventsCache.tmp.json');

async function loadCacheFromFile() {
  try {
    console.log('Chemin absolu du fichier de cache:', cacheFilePath);
    console.log('Tentative de chargement du cache à partir du fichier:', cacheFilePath);

    let fileExists = fsSync.existsSync(cacheFilePath);
    for (let i = 1; i <= 5; i++) {
      if (!fileExists) {
        console.log(`Tentative ${i}: Le fichier de cache n'existe pas encore. Réessayer après 100ms...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        fileExists = fsSync.existsSync(cacheFilePath);
      } else {
        break;
      }
    }

    if (fileExists) {
      console.log('Le fichier de cache est accessible.');
      const cacheData = await fs.readFile(cacheFilePath, 'utf8');
      const parsedCache = JSON.parse(cacheData);

      if (parsedCache.lastCacheUpdate) {
        globalCache.eventsCache = parsedCache.eventsCache;
        globalCache.lastCacheUpdate = parsedCache.lastCacheUpdate;
        console.log(`Cache chargé avec succès: lastCacheUpdate = ${globalCache.lastCacheUpdate}`);
      } else {
        throw new Error('lastCacheUpdate est manquant dans le fichier de cache');
      }
    } else {
      console.log('Le fichier de cache n\'existe pas après plusieurs tentatives.');
    }
  } catch (error) {
    console.error('Erreur lors du chargement du cache depuis le fichier:', error);
  }
}

async function saveCacheToFile() {
  try {
    // Vérifiez et créez le répertoire de cache si nécessaire
    if (!fsSync.existsSync(cacheDirPath)) {
      await fs.mkdir(cacheDirPath, { recursive: true });
      console.log(`Répertoire de cache créé: ${cacheDirPath}`);
    }

    const cacheData = {
      eventsCache: globalCache.eventsCache,
      lastCacheUpdate: globalCache.lastCacheUpdate,
    };

    await fs.writeFile(tempCacheFilePath, JSON.stringify(cacheData, null, 2));
    await fs.rename(tempCacheFilePath, cacheFilePath);
    console.log(`Cache sauvegardé avec succès: lastCacheUpdate = ${globalCache.lastCacheUpdate}`);

    // Double vérification après sauvegarde
    let fileExists = fsSync.existsSync(cacheFilePath);
    if (!fileExists) {
      console.error('Erreur: Le fichier de cache devrait exister après la sauvegarde, mais il n\'existe pas.');
    } else {
      console.log('Le fichier de cache a été créé et est accessible.');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache dans le fichier:', error);
  }
}

async function initializeCache() {
  console.log('Initialisation du cache...');
  try {
    await loadCacheFromFile();
  } catch (error) {
    console.error('Erreur lors du chargement initial du cache:', error);
  }

  const currentTime = Date.now();
  console.log(`Vérification du cache: currentTime = ${currentTime}, lastCacheUpdate = ${globalCache.lastCacheUpdate}`);
  if (!globalCache.eventsCache || (currentTime - globalCache.lastCacheUpdate) > cacheLifetime) {
    console.log('Le cache est considéré comme périmé ou inexistant.');
    try {
      await updateCache();
      console.log('Cache initialisé avec succès');
    } catch (error) {
      console.error('Échec de l\'initialisation du cache:', error);
      throw new Error('Erreur lors de l\'initialisation du cache: ' + error.message);
    }
  } else {
    console.log('Le cache est encore valide');
  }
  console.log('Nombre d\'événements dans le cache:', globalCache.eventsCache?.length);
}

async function updateCache() {
  if (globalCache.isUpdatingCache) {
    console.log('Une mise à jour du cache est déjà en cours');
    return globalCache.updatePromise;
  }

  globalCache.isUpdatingCache = true;
  globalCache.updatePromise = (async () => {
    try {
      console.log('Mise à jour du cache...');
      globalCache.eventsCache = await loadEventsFromGCS();
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

async function checkAndUpdateCache() {
  const currentTime = Date.now();
  console.log(`Vérification du cache: currentTime = ${currentTime}, lastCacheUpdate = ${globalCache.lastCacheUpdate}`);
  if ((currentTime - globalCache.lastCacheUpdate) > cacheLifetime) {
    console.log('Le cache est périmé, mise à jour en cours...');
    await updateCache();
  } else {
    console.log('Le cache est encore valide');
  }
  if (globalCache.updatePromise) {
    console.log('Attente de la fin de la mise à jour du cache...');
    await globalCache.updatePromise;
  }
  console.log('Nombre d\'événements dans le cache après mise à jour:', globalCache.eventsCache?.length);
  if (!globalCache.eventsCache || globalCache.eventsCache.length === 0) {
    throw new Error('Le cache n\'est toujours pas initialisé après la mise à jour.');
  }
}

let cacheInitialized = false;
async function initializeCacheOnce() {
  if (!cacheInitialized) {
    try {
      await initializeCache();
      cacheInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du cache:', error);
    }
  }
}

initializeCacheOnce().catch(error => {
  console.error('Erreur lors de l\'initialisation du cache:', error);
});

const getEventsCache = () => globalCache.eventsCache;

export { getEventsCache, checkAndUpdateCache, initializeCacheOnce as initializeCache };
