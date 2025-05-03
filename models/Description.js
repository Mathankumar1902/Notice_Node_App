const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String},
  status: { type: Number },
  profile: { type: String}, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Description', descriptionSchema);
