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
   
  contactLinks: {
    whatsapp: {
      type: String,
      
    },
    facebook: {
      type: String,
     
    },
    linkedin: {
      type: String,
     
    },
    twitter: {
      type: String,
     
    },
  },
  designation: {
    type: String,
   
  },
  aboutMe: {
    type: String,
    required: true,
  },
 
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
