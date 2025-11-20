const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Date is required."],
    },
    time: {
        type: String,
        required: [true, "Time is required."],
    },
    message: {
        type: String,
        required: [true, "Message is required."],
        trim: true,
        
    },
    status: {
        type: Boolean,
        default: false
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // match the registered user model name
        required: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;