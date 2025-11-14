const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // _id :mongoose.Schema.Types.ObjectId,
  firstName: {
    type: String,
    require: true,
    trim: true,
  },
  lastName: {
    type: String,
    require: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
    trim: true,
  },
  photo: [{ type: String }],
  password: {
    type: String,
   
    trim: true,
  },
  resetOTP: {
    type: String,
  },
  confirm_password: {
    type: String,
    
  },
  refral_code: { 
    type: String,
    
  },

});

//model

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
