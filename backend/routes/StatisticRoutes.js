const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedules');
const User = require('../models/Users');
const Assignment = require('../models/Assignments');
const Class = require('../models/Classes');
const Document = require('../models/Documents');
const Submission = require('../models/Submissions');
const Lesson = require('../models/Lessons');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/dashboard/teacher', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the teacher and populate their classes
        const teacher = await User.findById(decoded._id).populate('classes');
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: "Forbidden: User is not a teacher" });
        }

        const classes = teacher.classes.map((classItem) => classItem._id);

        // Get the number of classes
        const classCount = classes.length;

        // Get unique students across all classes (to avoid counting duplicates)
        const uniqueStudents = await Class.aggregate([
            { $match: { _id: { $in: classes } } },
            { $unwind: "$students" },
            { $group: { _id: "$students" } }, // Group by student ID to get unique students
            { $count: "uniqueStudentCount" }  // Count the unique students
        ]);

        // Get the total number of unique students
        const totalStudents = uniqueStudents.length > 0 ? uniqueStudents[0].uniqueStudentCount : 0;

        // Get the number of assignments
        const assignmentCount = await Assignment.countDocuments({ classId: { $in: classes } });

        // Get the number of documents
        const documentCount = await Document.countDocuments({ classId: { $in: classes } });

        // Get the number of submissions
        const submissionCount = await Submission.countDocuments({
            assignmentId: {
                $in: await Assignment.find({ classId: { $in: classes } }).distinct('_id')
            }
        });

        // Get the number of lessons
        const lessonCount = await Lesson.countDocuments({ classId: { $in: classes } });

        // Get the number of incoming schedules
        const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const incomingSchedules = await Schedule.find({
            class: { $in: classes },
            date: { $gte: currentDate }
        }).countDocuments();

        res.json({
            classCount,
            totalStudents, // Now correctly counts unique students
            assignmentCount,
            documentCount,
            submissionCount,
            lessonCount,
            incomingSchedules,
        });
    } catch (error) {
        console.error("Error in /dashboard API:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/dashboard/student', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the student and populate their classes
        const student = await User.findById(decoded._id).populate('classes');
        if (!student || student.role !== 'student') {
            return res.status(403).json({ message: "Forbidden: User is not a student" });
        }

        const classes = student.classId;

        // Get the number of classes
        const classCount = classes.length;

        // Get the number of assignments
        const assignmentCount = await Assignment.countDocuments({ classId: { $in: classes } });

        // Get the number of documents
        const documentCount = await Document.countDocuments({ classId: { $in: classes } });

        // Get the number of submissions
        const submissionCount = await Submission.countDocuments({ studentId: student._id });

        // Get the number of incoming schedules
        const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const incomingSchedules = await Schedule.find({
            class: { $in: classes },
            date: { $gte: currentDate }
        }).countDocuments();

        res.json({
            classCount,
            assignmentCount,
            documentCount,
            submissionCount,
            incomingSchedules,
        });
    } catch (error) {
        console.error("Error in /dashboard/student API:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;