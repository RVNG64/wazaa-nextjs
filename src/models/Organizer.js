const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true},
  organizationName: { type: String, required: true },
  profilePic: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  website: String,
  socialMedias: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    tiktok: String
  },
  email: { type: String, required: true },
  phone: String,
  address: String,
  city: String,
  zip: String,
  country: String,
  howwemet: String,
  hasCompletedProfile: { type: Boolean, default: false },
  favEvents: [String],
  eventsHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  viewedEventsTinda: [String],
  lastTindaViewDate: Date,
  tindayViewCount: Number,
  type: { type: String, default: 'organizer' },
  organizedEventsList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  notifications: [String]
});

const Organizer = mongoose.model('Organizer', organizerSchema);
module.exports = Organizer;
