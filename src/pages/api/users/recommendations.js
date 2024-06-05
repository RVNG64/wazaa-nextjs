// src/pages/api/users/recommendations.js
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';
import { checkAndUpdateCache, eventsCache } from '../../../cache';

const getUuidFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/([a-zA-Z0-9-]+)$/);
  return match ? match[1] : null;
};

// Fonction pour rechercher dans les collections User et Organizer
const findUserOrOrganizer = async (userId) => {
  let user = await User.findOne({ firebaseId: userId }).select('favEvents');
  if (!user) {
    user = await Organizer.findOne({ firebaseId: userId }).select('favEvents');
  }
  return user;
};

export default async function handler(req, res) {
  const { userId } = req.query;

  // Vérifier si userId est fourni
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    await checkAndUpdateCache();

    if (!eventsCache) {
      return res.status(503).send('Cache is initializing, please retry.');
    }

    const user = await findUserOrOrganizer(userId);
    if (!user) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    let recommendedEvents = [];

    if (eventsCache && user.favEvents) {
      const userFavEventUuids = user.favEvents;

      const userFavoriteThemes = eventsCache
        .filter(event => userFavEventUuids.includes(getUuidFromUrl(event['@id'])))
        .flatMap(event => {
          if (event && event.hasTheme) {
            return event.hasTheme.flatMap(theme => {
              if (theme && theme['rdfs:label'] && theme['rdfs:label'].fr) {
                return Array.isArray(theme['rdfs:label'].fr)
                  ? theme['rdfs:label'].fr.map(t => t.toLowerCase().trim())
                  : [theme['rdfs:label'].fr.toLowerCase().trim()];
              }
              return [];
            });
          }
          return [];
        });

      recommendedEvents = eventsCache
        .filter(event => event && event.hasTheme && !userFavEventUuids.includes(getUuidFromUrl(event['@id'])))
        .filter(event => event.hasTheme.some(theme => {
          const themeLabels = theme && theme['rdfs:label'] && theme['rdfs:label'].fr
            ? Array.isArray(theme['rdfs:label'].fr) ? theme['rdfs:label'].fr : [theme['rdfs:label'].fr]
            : [];
          return themeLabels.some(label => userFavoriteThemes.includes(label.toLowerCase().trim()));
        }));

      if (userFavoriteThemes.length === 0) {
        recommendedEvents = eventsCache
          .filter(event => event.hasAudience && event.hasAudience.some(audience => ['Nationale', 'Régionale'].includes(audience['rdfs:label'].fr)))
          .filter(event => !userFavEventUuids.includes(getUuidFromUrl(event['@id'])));
      }

      recommendedEvents = recommendedEvents.map(event => {
        return {
          id: event['@id'],
          image: event?.['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || 'default-image-url',
          title: event?.['rdfs:label']?.fr?.[0] || 'Titre non disponible',
          startDate: event?.['schema:startDate']?.[0] || 'Date non disponible',
          address: event?.['isLocatedAt']?.[0]?.['schema:address']?.[0]
            ? `${event['isLocatedAt'][0]['schema:address'][0]['schema:streetAddress']?.[0] || ''}, ${event['isLocatedAt'][0]['schema:address'][0]['schema:postalCode'] || ''} ${event['isLocatedAt'][0]['schema:address'][0]['schema:addressLocality'] || ''}`
            : 'Adresse non disponible'
        };
      });

      recommendedEvents = recommendedEvents.sort(() => 0.5 - Math.random()).slice(0, 12);
    }

    res.json(recommendedEvents);
  } catch (error) {
    console.error('Erreur lors de l’exécution de /recommendations:', error);
    res.status(500).send('Erreur serveur lors du traitement des recommandations');
  }
}
