// src/pages/api/loadEventsFromGCS.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n')
  }
});
const bucketName = 'wazaa-database';

async function loadEventsFromGCS() {
  console.log("Début de l'exécution de loadEventsFromGCS");

  const bucket = storage.bucket(bucketName);
  const indexFile = bucket.file('index.json');
  const [indexContents] = await indexFile.download();
  const index = JSON.parse(indexContents.toString());

  const removeAccents = (str) => {
    const accents =
      'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut =
      'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';

    return str.split('').map((letter, index) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');
  };

  const createEventSlug = (eventName) => {
    const noAccents = removeAccents(eventName);
    return noAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  const events = [];
  for (const item of index) {
    const eventFile = bucket.file(`objects/${item.file}`);
    try {
      const [eventContents] = await eventFile.download();
      const event = JSON.parse(eventContents.toString());
      if (event.isLocatedAt && event.isLocatedAt.length > 0) {
        const location = event.isLocatedAt[0]['schema:geo'];
        const latitude = parseFloat(location['schema:latitude']);
        const longitude = parseFloat(location['schema:longitude']);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const eventId = event['@id'].split('/').pop();
          const eventName = event['rdfs:label']?.fr?.[0] || '';
          const eventSlug = createEventSlug(eventName);
          const city = event.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
          const citySlug = city ? createEventSlug(city) : '';
          event.urlPath = `/event/${citySlug}/${eventSlug}/${eventId}`;

          events.push(event);
        }
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du fichier ${item.file}:`, error);
    }
  }

  console.log(`Chargement de ${events.length} événements détaillés depuis GCS`);
  return events;
}

module.exports = loadEventsFromGCS;
