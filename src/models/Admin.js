const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, //Convertir l'email en minuscules
  },
  phone: {type: String,},
  profilePic: String,
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
