const mongoose = require("mongoose");

const generateCustomId = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    let isUnique = false;

    while (!isUnique) {
        result = "";
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Kiểm tra xem ID đã tồn tại chưa
        const existingClass = await mongoose.model("Class").findById(result);
        if (!existingClass) {
            isUnique = true;
        }
    }
    return result;
};

const classSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: generateCustomId, // Custom 5-character string ID, not ObjectId
        },

        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // required: true, Comment this will prevent enroll error
            validate: {
                validator: async function (userId) {
                    const user = await mongoose.model("User").findById(userId);
                    return user && user.role === "teacher"; // Ensure teacherId is a teacher
                },
                message: "teacherId must reference a user with role 'teacher'",
            },
        },

        numberOfStudents: {
            type: Number,
            default: 0,
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                validate: {
                    validator: async function (userId) {
                        const user = await mongoose.model("User").findById(userId);
                        return user && user.role === "student"; // Ensure studentId is a student
                    },
                    message: "students must reference users with role 'student'",
                },
            },
        ],

        lessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lesson",
            },
        ],

        assignments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Assignment",
            },
        ],

        documents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Document",
            },
        ],
    },
    { timestamps: true }
);

// Sử dụng async trong schema
classSchema.pre('validate', async function (next) {
    if (!this._id) {
        this._id = await generateCustomId();
    }
    next();
});

const ClassModel = mongoose.model("Class", classSchema);

module.exports = ClassModel;
