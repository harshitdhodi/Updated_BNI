const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../model/member');

const myAskSchema = new Schema({
  companyName: {
    type: String,
    required: true,
  },
  dept: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  }
}, {
  timestamps: true
});

const MyAsk = mongoose.model('MyAsk', myAskSchema);

module.exports = MyAsk;
