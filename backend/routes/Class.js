const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Class = require("../models/Classes");
const Document = require("../models/Documents");
const Assignment = require("../models/Assignments");
const Lesson = require("../models/Lessons");
const Submission = require("../models/Submissions");
const Schedule = require("../models/Schedules");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require("mongoose");

//Get all classes from specific student
router.get("/student", async (req, res) => {
    const authHeader = req.headers.authorization;

    // Ensure token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received Token:", token); // Debugging

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Token:", decoded); // Debugging

        // Find the user using ID from token
        const user = await User.findById(decoded._id)
            .populate({
                path: "classId",
                populate: { path: "userId", select: "fullname" } // Populate teacherId with fullname
            });

        if (!user || user.role !== "student") {
            return res.status(404).json({ message: "Student not found!" });
        }

        res.status(200).json(user.classId);
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token", error: error.message });
    }
});

//Get all classes from specific teacher
router.get("/teacher", async (req, res) => {
    const authHeader = req.headers.authorization;

    // Ensure token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received Token:", token); // Debugging

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Token:", decoded); // Debugging

        // Find the user using ID from token
        const user = await User.findById(decoded._id)
            .populate({
                path: "classes",
                populate: { path: "userId", select: "fullname" }
            })

        if (!user || user.role !== "teacher") {
            return res.status(404).json({ message: "Teacher not found!" });
        }

        res.status(200).json(user.classes);
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token", error: error.message });
    }
});

// Get all students from all classes managed by a specific teacher
router.get("/teacher/all-students", async (req, res) => {
    const authHeader = req.headers.authorization;

    // Ensure token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the teacher using ID from token
        const teacher = await User.findById(decoded._id).populate("classes");
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({ message: "Teacher not found!" });
        }

        // Get all classes managed by the teacher
        const classIds = teacher.classes.map((classItem) => classItem._id);

        // Find all students in these classes and include class names
        const classes = await Class.find({ _id: { $in: classIds } })
            .populate("students", "fullname email school city dob classroom")
            .select("id name students"); // Include class name and students

        // Create a map to group students by their ID
        const studentMap = new Map();

        classes.forEach((classItem) => {
            // Only process classItem.students if it exists and is an array
            if (classItem.students && Array.isArray(classItem.students)) {
                classItem.students.forEach((student) => {
                    // Only process student if it exists and has _id
                    if (student && student._id) {
                        const studentId = student._id.toString();

                        if (!studentMap.has(studentId)) {
                            // If the student is not already in the map, add them
                            studentMap.set(studentId, {
                                ...student.toObject(),
                                className: [classItem.name], // Initialize className as an array
                                classId: [classItem._id.toString()]
                            });
                        } else {
                            // If the student is already in the map, add the class name to their className array
                            studentMap.get(studentId).className.push(classItem.name);
                            studentMap.get(studentId).classId.push(classItem._id.toString());
                        }
                    }
                });
            }
        });

        // Convert the map values to an array
        const allStudents = Array.from(studentMap.values());

        res.status(200).json({ teacher: teacher.fullname, students: allStudents });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
});

// Get all documents from all classes managed by a specific teacher
router.get("/teacher/all-documents", async (req, res) => {
    const authHeader = req.headers.authorization;

    // Ensure token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the teacher using ID from token
        const teacher = await User.findById(decoded._id).populate("classes");
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({ message: "Teacher not found!" });
        }

        // Get all classes managed by the teacher
        const classIds = teacher.classes.map((classItem) => classItem._id);

        // Find all documents in these classes and include class names
        const classes = await Class.find({ _id: { $in: classIds } })
            .populate("documents", "filename path size uploadDate name description")
            .select("name documents"); // Include class name and documents

        // Create a map to group documents by their ID
        const documentMap = new Map();

        classes.forEach((classItem) => {
            classItem.documents.forEach((document) => {
                const documentId = document._id.toString();

                if (!documentMap.has(documentId)) {
                    // If the document is not already in the map, add it
                    documentMap.set(documentId, {
                        ...document.toObject(),
                        className: [classItem.name], // Initialize className as an array
                        classId: [classItem.id], // Initialize classId as an array
                    });
                } else {
                    // If the document is already in the map, add the class name to its className array
                    documentMap.get(documentId).className.push(classItem.name);
                }
            });
        });

        // Convert the map values to an array
        const allDocuments = Array.from(documentMap.values());

        res.status(200).json({ teacher: teacher.fullname, documents: allDocuments });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Error fetching documents", error: error.message });
    }
});

// Get all documents from all classes from a specific student
router.get("/student/all-documents", async (req, res) => {
    const authHeader = req.headers.authorization;

    // Ensure token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the teacher using ID from token
        const student = await User.findById(decoded._id).populate("classId");
        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found!" });
        }

        // Get all classes managed by the teacher
        const classIds = student.classId;

        // Find all documents in these classes and include class names
        const classes = await Class.find({ _id: { $in: classIds } })
            .populate("documents", "filename path size uploadDate name description")
            .select("name documents"); // Include class name and documents

        // Create a map to group documents by their ID
        const documentMap = new Map();

        classes.forEach((classItem) => {
            classItem.documents.forEach((document) => {
                const documentId = document._id.toString();

                if (!documentMap.has(documentId)) {
                    // If the document is not already in the map, add it
                    documentMap.set(documentId, {
                        ...document.toObject(),
                        className: [classItem.name], // Initialize className as an array
                        classId: [classItem.id], // Initialize classId as an array
                    });
                } else {
                    // If the document is already in the map, add the class name to its className array
                    documentMap.get(documentId).className.push(classItem.name);
                }
            });
        });

        // Convert the map values to an array
        const allDocuments = Array.from(documentMap.values());

        res.status(200).json({ student: student.fullname, documents: allDocuments });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Error fetching documents", error: error.message });
    }
});

//User have role 'student' enroll in a class
router.put("/enroll/:classId", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user and check if he/she is a student
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "Student not found!" });
        }
        if (user.role !== "student") {
            return res.status(403).json({ message: "Forbidden: Only students can enroll in classes!" });
        }

        const _class = await Class.findById(req.params.classId);
        if (!_class) {
            return res.status(404).json({ message: "Class not found!" });
        }

        // Check if student is already enrolled
        if (_class.students.includes(user._id)) {
            return res.status(400).json({ message: "Student already enrolled!" });
        }

        // Add student to class
        _class.students.push(user._id);
        _class.numberOfStudents = _class.students.length;
        await _class.save();

        // Ensure classId is an array before pushing
        if (!user.classId) {
            user.classId = [];
        }
        user.classId.push(req.params.classId);
        await user.save();

        res.status(200).json({ message: "Student enrolled successfully", class: _class });
    } catch (error) {
        res.status(500).json({ message: "Error enrolling student", error: error.message });
    }
});

//Get specific class
router.get("/:id", async (req, res) => {
    try {
        const classFound = await Class.findById(req.params.id)
            .populate("userId", "fullname")
        if (classFound) {
            res.json(classFound);
        } else {
            res.status(404).send("Cannot find class!");
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching class", error: error.message });
    }
});

//Create class
router.post("/create", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user and check if he/she is a teacher
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "Teacher not found!" });
        }
        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Forbidden: Only teachers can create classes!" });
        }

        const _class = new Class({
            name: req.body.name,
            description: req.body.description,
            startDate: req.body.startDate,
            userId: user._id,
            numberOfStudents: 0,
            students: [],
            lessons: [],
            assignments: [],
            documents: [],
        });

        const newClass = await _class.save();

        // Update teacher's classes array
        if (!user.classes) {
            user.classes = [];
        }
        user.classes.push(newClass._id);
        await user.save();

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: "Error creating class", error: error.message });
    }
});

//Modify class information
router.put("/:id", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user and check if he/she is a teacher
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "Teacher not found!" });
        }
        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Forbidden: Only teachers can modify classes!" });
        }

        const existingClass = await Class.findById(req.params.id);
        if (!existingClass) {
            return res.status(404).json({ message: "Class not found!" });
        }

        // Kiểm tra quyền sở hữu lớp học
        if (existingClass.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền tạo bài tập cho lớp học này!" });
        }

        // Update class fields
        existingClass.name = req.body.name || existingClass.name;
        existingClass.description = req.body.description || existingClass.description;
        existingClass.startDate = req.body.startDate || existingClass.startDate;

        // Save updated class
        const updatedClass = await existingClass.save();

        res.status(201).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: "Error modifying class", error: error.message });
    }
});

//Delete class
router.delete("/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (!user || user.role !== "teacher") {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Forbidden: Only teachers can delete classes!" });
        }

        const classId = req.params.id;
        const classToDelete = await Class.findById(classId).session(session);
        if (!classToDelete) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Class not found" });
        }

        if (classToDelete.userId.toString() !== user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Forbidden: You can only delete your own classes" });
        }

        // Xóa tài liệu và cập nhật mảng documents
        await Document.deleteMany({ classId: classId }).session(session);
        await Class.findByIdAndUpdate(classId, { $set: { documents: [] } }).session(session);

        // Xóa bài tập và bài nộp
        const assignments = await Assignment.find({ classId: classId }).session(session);
        for (const assignment of assignments) {
            await Submission.deleteMany({ assignmentId: assignment._id }).session(session);
        }
        await Assignment.deleteMany({ classId: classId }).session(session);
        await Class.findByIdAndUpdate(classId, { $set: { assignments: [] } }).session(session);

        // Xóa bài học
        await Lesson.deleteMany({ classId: classId }).session(session);
        await Class.findByIdAndUpdate(classId, { $set: { lessons: [] } }).session(session);

        // Xóa lịch
        await Schedule.deleteMany({ class: classId }).session(session);

        // Xóa tham chiếu lớp học từ học sinh và giáo viên
        await User.updateMany(
            { classId: classId },
            { $pull: { classId: classId } },
            { session }
        );
        await User.updateMany(
            { classes: classId },
            { $pull: { classes: classId } },
            { session }
        );

        // Xóa lớp học
        await Class.findByIdAndDelete(classId).session(session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: "Class and related data deleted successfully" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error deleting class:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

//Show members in class
router.get("/:id/member", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const classFound = await Class.findById(req.params.id)
            .populate("students", "fullname school email city dob classroom")
            .populate("userId", "fullname");

        if (classFound) {
            res.json(classFound.students);
        } else {
            res.status(404).send("Cannot find class!");
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching class members", error: error.message });
    }
});

//Show all documents in class
router.get("/:id/document", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const classFound = await Class.findById(req.params.id)
            .populate("documents", "filename path size name description uploadDate classId")
            .populate("userId", "fullname");

        if (classFound) {
            res.json(classFound.documents);
        } else {
            res.status(404).send("Cannot find class!");
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching class documents", error: error.message });
    }
});

// Show all assignments in a class
router.get("/:id/assignment", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Find the class by ID and populate assignments
        const classFound = await Class.findById(req.params.id)
            .populate("assignments", "title name description dueDate classId attachments status")
            .populate("userId", "fullname");

        if (classFound) {
            res.json(classFound.assignments); // Return assignments instead of documents
        } else {
            res.status(404).json({ message: "Cannot find class!" });
        }
    } catch (error) {
        console.error("Error fetching class assignments:", error);
        res.status(500).json({ message: "Error fetching class assignments", error: error.message });
    }
});

module.exports = router;
