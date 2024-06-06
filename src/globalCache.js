import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

let eventsCache = null;
let lastCacheUpdate = 0;
let isUpdatingCache = false;
let updatePromise = null;
let cacheInitialized = false;

const cacheMetaFilePath = path.resolve('/mnt/wslg/distro/home/rvng64/code/RVNG64/dotfiles/wazaa-nextjs/cache/cacheMeta.json');

async function loadCacheMeta() {
  try {
    if (fsSync.existsSync(cacheMetaFilePath)) {
      const meta = await fs.readFile(cacheMetaFilePath, 'utf8');
      const { lastCacheUpdate: lastUpdate } = JSON.parse(meta);
      lastCacheUpdate = lastUpdate;
      console.log(`Cache meta loaded: lastCacheUpdate = ${lastCacheUpdate}`);
    }
  } catch (error) {
    console.error('Error loading cache meta:', error);
  }
}

async function saveCacheMeta() {
  try {
    const meta = { lastCacheUpdate };
    await fs.writeFile(cacheMetaFilePath, JSON.stringify(meta, null, 2));
    console.log('Cache meta saved:', meta);
  } catch (error) {
    console.error('Error saving cache meta:', error);
  }
}

const globalCache = {
  get eventsCache() {
    return eventsCache;
  },
  set eventsCache(value) {
    eventsCache = value;
  },
  get lastCacheUpdate() {
    return lastCacheUpdate;
  },
  set lastCacheUpdate(value) {
    lastCacheUpdate = value;
    saveCacheMeta();
  },
  get isUpdatingCache() {
    return isUpdatingCache;
  },
  set isUpdatingCache(value) {
    isUpdatingCache = value;
  },
  get updatePromise() {
    return updatePromise;
  },
  set updatePromise(value) {
    updatePromise = value;
  },
  get cacheInitialized() {
    return cacheInitialized;
  },
  set cacheInitialized(value) {
    cacheInitialized = value;
  }
};

await loadCacheMeta();

export default globalCache;
