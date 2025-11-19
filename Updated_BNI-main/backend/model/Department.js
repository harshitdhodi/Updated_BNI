const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
    name: { type: String, required: true , unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } 
});
DepartmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;
