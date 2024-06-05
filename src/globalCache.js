// src/globalCache.js
let eventsCache = null;
let lastCacheUpdate = 0;
let isUpdatingCache = false;
let updatePromise = null;

const globalCache = {
  eventsCache,
  lastCacheUpdate,
  isUpdatingCache,
  updatePromise
};

export default globalCache;
