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
    type: String,
    required: true,
  },
  mobile: {
    type: String,
     default: ""
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
    required: true,
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
