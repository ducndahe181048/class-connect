const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    name: String,
    description: String,
    filename: String,
    path: String, // Đường dẫn file
    size: Number,
    classId: { type: String, ref: "Class", require: true }, // Liên kết với lớp học
    uploadDate: { type: Date, default: Date.now },
});

documentSchema.index({ classId: 1 });

module.exports = mongoose.model("Document", documentSchema);
