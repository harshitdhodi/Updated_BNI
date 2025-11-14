const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Member = require('../model/member');
const CompanySchema = new Schema({
  bannerImg: {
    type: String,
  
  },
  profileImg: {
    type: String,
    
  },
   companyName: {
    type: String,
 
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
  companyAddress: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: Member,
    required: true,
  },

}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
