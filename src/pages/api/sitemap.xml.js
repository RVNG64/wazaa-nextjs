// src/pages/api/sitemap.xml.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { checkAndUpdateCache, eventsCache } from '../../cache';

export default async function handler(req, res) {
  try {
    // Vérifier et mettre à jour le cache si nécessaire
    await checkAndUpdateCache();

    if (!eventsCache) {
      return res.status(503).json({ error: 'Cache is initializing, please retry.' });
    }

    const staticUrls = [
      { url: '/', changefreq: 'daily', priority: 1 },
      { url: '/qui-sommes-nous', changefreq: 'monthly', priority: 0.7 },
      { url: '/faq', changefreq: 'monthly', priority: 0.5 },
      { url: '/evenement', changefreq: 'weekly', priority: 0.5 },
      { url: '/mentions-legales', changefreq: 'monthly', priority: 0.3 },
      { url: '/connexion-choice', changefreq: 'monthly', priority: 0.4 },
      { url: '/connexion-pro', changefreq: 'monthly', priority: 0.3 },
      { url: '/connexion', changefreq: 'monthly', priority: 0.3 },
      { url: '/inscription-choice', changefreq: 'monthly', priority: 0.4 },
      { url: '/inscription-pro', changefreq: 'monthly', priority: 0.3 },
      { url: '/inscription', changefreq: 'monthly', priority: 0.3 },
    ];

    const eventUrls = eventsCache.map(event => ({
      url: event.urlPath,
      changefreq: 'weekly',
      priority: 0.5
    }));

    const links = [...staticUrls, ...eventUrls];

    const stream = new SitemapStream({ hostname: 'https://www.wazaa.app/' });
    const xmlStream = new Readable({ read() {} });

    xmlStream.pipe(stream).pipe(res).on('error', (e) => { throw e });
    links.forEach(link => stream.write(link));
    stream.end();
    xmlStream.push(null);
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    res.status(500).send('Erreur serveur lors de la génération du sitemap');
  }
}
