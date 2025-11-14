const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
    name: { type: String, required: true },
    countryName: { type: String, required: true },
    city: { type: String,  },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } 
});
ChapterSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
const Chapter = mongoose.model('Chapter', ChapterSchema);
module.exports = Chapter;
