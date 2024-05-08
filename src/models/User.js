const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true},
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  profilePic: String,
  gender: String,
  dob: String,
  city: String,
  zip: String,
  country: String,
  howwemet: String,
  hasCompletedProfile: { type: Boolean, default: false },
  mapPerso: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MyWazaa' }],
  favEvents: [String],
  privateEventsOrganized: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  viewedEventsTinda: [String],
  lastTindaViewDate: Date,
  tindayViewCount: Number,
  type: { type: String, default: 'user' },
  notifications: [String]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
