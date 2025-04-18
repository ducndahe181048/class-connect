const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

// Schema for file attachments
const AttachmentSchema = new Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Main Assignment schema
const AssignmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    classId: {
        type: String,
        ref: 'Class', // Reference to Class model
        required: true
    },
    attachments: [AttachmentSchema],
    submissionCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

// Create a virtual property for status (active, due soon, overdue)
AssignmentSchema.virtual('status').get(function () {
    const now = moment().utc();
    const dueDate = moment(this.dueDate).utc();

    if (dueDate.isBefore(now)) {
        return 'Đã quá hạn';
    } else if (dueDate.diff(now, 'hours') < 24) {
        return 'Gần đến hạn';
    } else {
        return 'Chưa đến hạn';
    }
});

// Ensure virtual fields are included when converting to JSON
AssignmentSchema.set('toJSON', { virtuals: true });
AssignmentSchema.set('toObject', { virtuals: true });

AssignmentSchema.index({ classId: 1 });

const Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;