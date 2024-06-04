import { Storage } from '@google-cloud/storage';
import PQueue from 'p-queue';

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n')
  }
});

const bucketName = 'wazaa-database';
const MAX_CONCURRENT_REQUESTS = 100; // Limiter à 100 requêtes simultanées
const queue = new PQueue({ concurrency: MAX_CONCURRENT_REQUESTS });

async function loadEventsFromGCS() {
  console.log('Début de l\'exécution de loadEventsFromGCS');

  const bucket = storage.bucket(bucketName);
  const indexFile = bucket.file('index.json');
  const [indexContents] = await indexFile.download();
  const index = JSON.parse(indexContents.toString());

  const removeAccents = (str) => {
    const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut = 'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';

    return str.split('').map((letter) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');
  };

  const createEventSlug = (eventName) => {
    const noAccents = removeAccents(eventName);
    return noAccents.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
  };

  const loadEvent = async (item) => {
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

          return event;
        }
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du fichier ${item.file}:`, error);
      return null;
    }
  };

  try {
    const events = await queue.addAll(index.map(item => () => loadEvent(item)));
    const validEvents = events.filter(event => event !== null);

    console.log(`Chargement de ${validEvents.length} événements détaillés depuis GCS`);
    return validEvents;
  } catch (error) {
    console.error('Erreur lors du chargement des événements depuis GCS:', error);
    throw new Error('Erreur lors du chargement des événements depuis GCS: ' + error.message);
  }
}

export default loadEventsFromGCS;
