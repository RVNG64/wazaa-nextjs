// src/pages/api/native-events/search.js
import { validationResult } from 'express-validator';
import Event from '../../../models/Event';
import dbConnect from '../../../utils/dbConnect';

const normalizeString = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default async function handler(req, res) {
  await dbConnect();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extraction des critères de recherche depuis le corps de la requête
    const { searchTerm, startDate, endDate, eventType, theme, audience, tags, page = 1 } = req.body;
    console.log('Recherche d\'événements natifs:', req.body);

    // Création de la requête de recherche
    let query = Event.find({
      'validationStatus': 'approved',
      'type': 'public'
    });

    // Filtrage basé sur les critères de recherche
    if (searchTerm) {
      const normalizedSearchTerm = normalizeString(searchTerm);
      query = query.where({
        $or: [
          { 'name': new RegExp(normalizedSearchTerm, 'i') }, // Recherche par nom, insensible à la casse et aux accents (i)
          { 'description': new RegExp(normalizedSearchTerm, 'i') }, // Recherche par description, insensible à la casse et aux accents (i)
          { 'organizerName': new RegExp(normalizedSearchTerm, 'i') }, // Recherche par nom de l'organisateur, insensible à la casse et aux accents (i)
          { 'theme': new RegExp(normalizedSearchTerm, 'i') }, // Recherche par catégorie, insensible à la casse et aux accents (i)
          { 'tags': new RegExp(normalizedSearchTerm, 'i') } // Recherche par tags, insensible à la casse et aux accents (i)
        ]
      });
    }

    // Filtrage par date de début et de fin
    if (startDate) {
      query = query.where('startDate').gte(new Date(startDate));
    }
    if (endDate) {
      query = query.where('endDate').lte(new Date(endDate));
    }

    // Pagination
    const limit = 10; // Nombre d'événements par page
    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(query); // Compte total des événements correspondants

    query = query.sort({ 'startDate': -1 }).skip(skip).limit(limit); // Application de la pagination et du tri

    const nativeEvents = await query.exec(); // Exécution de la requête

    res.json({
      results: nativeEvents,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'événements natifs:', error);
    res.status(500).send('Erreur serveur lors de la recherche');
  }
}
