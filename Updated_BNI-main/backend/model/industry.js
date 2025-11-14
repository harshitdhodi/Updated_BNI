const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IndustrySchema = new Schema ( {
    name : { type : String, required : true},
    createdAt: { type: Date, default: Date.now },
    // member: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Member',
    //     required: true,
    //   },
    updatedAt: { type: Date, default: Date.now } 
});
 
IndustrySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
const Industry = mongoose.model('Industry', IndustrySchema)
module.exports = Industry ; 
