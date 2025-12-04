const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Member = require('../model/member');
const ProfileSchema = new Schema({
  bannerImg: {
    type: String,
  },
  profileImg: {
    type: String,
  
  },
   industryName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true,
  },
  mobile: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple documents to have no mobile number, but if it exists, it must be unique.
  },
  email: {
    type: String,
     default: ""
  },
    whatsapp: {
      type: String,
       default: ""
    },
    facebook: {
      type: String,
      default: ""
    },
    linkedin: {
      type: String,
      default: ""
    },
    twitter: {
      type: String,
      default: ""
    },
  
  designation: {
    type: String,
 
  },
  aboutCompany: {
    type: String,
   
  },
  companyName: {
    type: String,
    required: true,
  },
  companyAddress: {
    type: String,
  
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: Member,
    required: true,
  },
  catalog: {
    type: String,
   
  },
}, { timestamps: true });

module.exports = mongoose.model('Business', ProfileSchema);
