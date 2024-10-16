const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
    name: { type: String, required: true },
    short_name: { type: String, required: true },
    photo: [{ type: String, required: true }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } 
});
CountrySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
const Country = mongoose.model('Country', CountrySchema);
module.exports = Country;
