// src/utils/memoryUsageMonitor.js
const process = require('process');

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log(`RSS: ${memoryUsage.rss / 1024 / 1024} MB`);
  console.log(`Heap Total: ${memoryUsage.heapTotal / 1024 / 1024} MB`);
  console.log(`Heap Used: ${memoryUsage.heapUsed / 1024 / 1024} MB`);
  console.log(`External: ${memoryUsage.external / 1024 / 1024} MB`);
}, 10000); // Exécute toutes les 10 secondes
