const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Member = require('../model/member')
const companySchema = new Schema({
  companyName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  webURL: {
    type: String,
    required: true,
  },
  dept: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: Member,
    required: true,
  }
}, {
  timestamps: true
});

const myGives = mongoose.model('myGives', companySchema);

module.exports = myGives;
