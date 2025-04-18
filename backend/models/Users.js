const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true },

        role: { type: String, enum: ["student", "teacher"], required: true },

        school: { type: String, required: true },
        city: { type: String, required: true },
        dob: { type: Date, required: true },

        // Student fields
        classroom: { type: String }, // Only for students
        classId: [{ type: String, ref: "Class" }], // Class IDs (5-char random strings)

        // Teacher fields
        classes: [{ type: String, ref: "Class" }], // Class IDs (5-char random strings)

    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (this.isModified('classes') && this.role !== 'teacher') {
        return next(new Error('Only teachers can be assigned to classes'));
    }
    if (this.isModified('classId') && this.role !== 'student') {
        return next(new Error('Only students can be assigned to classId'));
    }
    next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;