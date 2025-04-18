const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    }
});

const SubmissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    files: [FileSchema],
    status: {
        type: String,
        enum: ['Submitted', 'Graded'],
        default: 'Submitted'
    },
    score: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

SubmissionSchema.index({ assignmentId: 1, studentId: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);