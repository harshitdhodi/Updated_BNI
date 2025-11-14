const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for user
const ClientSchema = new Schema({
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  chapter: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirm_password: {
    type: String,
  
  },
  
});

// Create and export User model based on schema
const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
