const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    filename: String,
    path: String, // Đường dẫn file trên server hoặc URL Cloudinary
    size: Number,
    classId: { type: String, ref: "Class", require: true }, // Liên kết với lớp học
    uploadDate: { type: Date, default: Date.now },
});

lessonSchema.index({ classId: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
