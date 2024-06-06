// src/app/sitemap.tsx
import { MetadataRoute } from 'next';
import { initializeCache, getEventsCache } from '../../src/cache';

interface Event {
  urlPath: string;
  lastUpdateDatatourisme: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Initialiser le cache si nécessaire
    await initializeCache();

    // Obtenir le cache des événements
    const eventsCache: Event[] = getEventsCache();

    // Vérifier si le cache des événements est disponible
    if (!eventsCache || eventsCache.length === 0) {
      throw new Error('Cache is initializing, please retry.');
    }

    // URLs statiques
    const staticUrls: MetadataRoute.Sitemap = [
      { url: 'https://www.wazaa.app/', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: 'https://www.wazaa.app/qui-sommes-nous', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: 'https://www.wazaa.app/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: 'https://www.wazaa.app/evenement', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
      { url: 'https://www.wazaa.app/mentions-legales', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
      { url: 'https://www.wazaa.app/connexion-choice', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
      { url: 'https://www.wazaa.app/connexion-pro', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
      { url: 'https://www.wazaa.app/connexion', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
      { url: 'https://www.wazaa.app/inscription-choice', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
      { url: 'https://www.wazaa.app/inscription-pro', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
      { url: 'https://www.wazaa.app/inscription', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    // URLs des événements dynamiques
    const eventUrls: MetadataRoute.Sitemap = eventsCache.map((event: Event) => {
      let lastModified;
      try {
        lastModified = event.lastUpdateDatatourisme ? new Date(event.lastUpdateDatatourisme).toISOString() : new Date().toISOString();
      } catch {
        // Si la date est invalide, utilisez la date du jour
        console.warn(`Date invalide pour l'événement: ${event.urlPath}`);
        lastModified = new Date().toISOString(); // ou continue pour ignorer cet événement
      }
      return {
        url: `https://www.wazaa.app${event.urlPath}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.5
      };
    });

    return [...staticUrls, ...eventUrls];
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    throw new Error('Erreur serveur lors de la génération du sitemap');
  }
}
