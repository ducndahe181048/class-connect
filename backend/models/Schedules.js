const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    class: { type: String, required: true },
    date: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
