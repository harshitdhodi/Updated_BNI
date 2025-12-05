const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  bannerImg: {
    type: String,
    default: null,  // Optional
  },
  profileImg: {
    type: String,
    default: null,  // Optional
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  country: {
    type: String,
    // required: true,
  },
  city: {
    type: String,
    // required: true,
  },
  refral_code: {
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
  password: {
    type: String,
    required: true,
    trim: true,
  },
  resetOTP: {
    type: String,
  },
  approvedByadmin: {
    type: String,
    default: "pending",  // Optional
  },
  approvedBymember: {
    type: String,
    default: "pending",  // Optional
  },
  deviceTokens: {
    type: [String], // Array of strings to store multiple device tokens
    default: [], // Default to an empty array
  },
  isOnBoarded: {
    type: Boolean,
    default: false,
  },
  ref_member: {
    type: String,
    default: "",
  }
}, {
  versionKey: false, // This will remove the __v field
  timestamps: true,  // Enable timestamps
});

const Customer = mongoose.model("Member", customerSchema);
module.exports = Customer;
