// src/pages/api/native-events.js
import Event from '../../models/Event';
import dbConnect from '../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  // Récupération et décomposition des paramètres de requête
  const ne = req.query.ne ? req.query.ne.split(',') : [];
  const sw = req.query.sw ? req.query.sw.split(',') : [];

  // Conversion des coordonnées en nombres
  const northEastLat = parseFloat(ne[0]);
  const northEastLng = parseFloat(ne[1]);
  const southWestLat = parseFloat(sw[0]);
  const southWestLng = parseFloat(sw[1]);

  if (isNaN(northEastLat) || isNaN(northEastLng) || isNaN(southWestLat) || isNaN(southWestLng)) {
    return res.status(400).send('Paramètres de requête invalides');
  }

  try {
    const nativeEvents = await Event.find({
      'location.latitude': { $gte: southWestLat, $lte: northEastLat },
      'location.longitude': { $gte: southWestLng, $lte: northEastLng },
      'validationStatus': 'approved',
      'type': 'public',
    });

    console.log('Événements natifs filtrés:', nativeEvents.length);
    res.json(nativeEvents);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements natifs:', error);
    res.status(500).send('Erreur serveur lors de la récupération');
  }
}
