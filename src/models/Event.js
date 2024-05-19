const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const attendanceEntrySchema = new mongoose.Schema({
  firebaseId: { type: String, required: true },
  status: { type: String, enum: ['Participating', 'Maybe', 'Not Participating'], default: 'Maybe' }
});

const eventSchema = new mongoose.Schema({
  // Identification et Détails de Base
  eventID: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  organizerName: String,
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: String,
  endTime: String,

  // Médias
  photoUrl: String,
  videoUrl: String,

  // Description et Organisation
  description: String,
  userOrganizer: { type: String, ref: 'User' },
  professionalOrganizer: { type: String, ref: 'Organizer' },
  eventWazaaURL: String,
  website: String,
  ticketLink: String,

  // Classification
  category: String,
  subcategory: String,
  tags: [String],
  audience: String,

  // Localisation et Accessibilité
  location: {
    address: String,
    postalCode: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  accessibleForDisabled: Boolean,

  // Tarification et Capacité
  priceOptions: {
    isFree: { type: Boolean, default: false },
    uniquePrice: { type: Number, default: 0 },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    }
  },
  acceptedPayments: [String],
  capacity: Number,

  // Statut et Type d'Événement
  type: { type: String, enum: ['public', 'private'] },
  validationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'default'], default: 'default' },

  // Participants et Inscriptions
  attendance: [attendanceEntrySchema],

  // Statistiques
  views: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 }
});

// Vérifie si le modèle existe déjà, sinon le crée
const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = EventModel;
