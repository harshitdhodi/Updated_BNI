const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Country = require("./country")
const CitySchema = new Schema({
  name: { type: String, required: true },
  countryName: {
    type: String,
    ref: Country,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
CitySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const City = mongoose.model("City", CitySchema);
module.exports = City;
