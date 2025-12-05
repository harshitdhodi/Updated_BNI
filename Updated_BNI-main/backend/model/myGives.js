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
    // required: true,
   
  },
  phoneNumber: {
    type: String,
  },
  webURL: {
    type: String,
  },
  dept: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
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
