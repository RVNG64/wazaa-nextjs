// src/redis.js
import { createClient } from 'redis';

// Utilise l'URL de Redis depuis les variables d'environnement ou 'redis://localhost:6379' par défaut pour le développement local
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (err) {
    console.error('Redis client connection error', err);
  }
})();

export default redisClient;
