const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignments');
const User = require('../models/Users');
const Class = require('../models/Classes');
const jwt = require('jsonwebtoken');

// Configure storage for document files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/classroom-management/backend/uploads/assignments');
    },

    filename: function (req, file, cb) {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + "_" + originalName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Check file extension
        const allowedExtensions = /\.(pdf|docx|doc|txt|xls|xlsx|ppt|pptx)$/i;
        const extname = allowedExtensions.test(file.originalname.toLowerCase());

        // Check mimetype separately with appropriate patterns
        const mimetypes = {
            'application/pdf': true,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // docx
            'application/msword': true, // doc
            'text/plain': true, // txt
            'application/vnd.ms-excel': true, // xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true, // xlsx
            'application/vnd.ms-powerpoint': true, // ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': true // pptx
        };

        if (extname && mimetypes[file.mimetype]) {
            return cb(null, true); // Accept the file
        } else {
            return cb(new Error("Only PDF, DOCX, DOC, TXT, XLS, XLSX, PPT, and PPTX files are allowed!")); // Reject the file
        }
    }
});

// GET all assignments
router.get('/assignments', async (req, res) => {
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
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }

        const assignments = await Assignment.find()
            .sort({ createdAt: -1 }) // Newest first
            .populate('classId', 'name'); // Include class name
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET single assignment by ID
router.get('/assignments/:id', async (req, res) => {
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
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }
        const assignment = await Assignment.findById(req.params.id)
            .populate('classId', 'name');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET assignments for student
router.get('/student/assignments', async (req, res) => {
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
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (user.role !== "student") {
            return res.status(403).json({ message: "Người dùng không phải là học sinh!" });
        }

        // Get IDs of classes the student is enrolled in
        const enrolledClasses = await Class.find(
            { students: user._id },
            { _id: 1 }
        );

        const classIds = enrolledClasses.map(cls => cls._id);

        // Find all assignments for these classes
        const assignments = await Assignment.find({
            classId: { $in: classIds }
        })
            .sort({ dueDate: 1 }) // Sort by due date
            .populate('classId', 'name');

        res.json(assignments);
    } catch (error) {
        console.error('Error fetching student assignments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single assignment by ID for student
router.get('/student/assignments/:id', async (req, res) => {
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
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        const assignment = await Assignment.findById(req.params.id)
            .populate('classId', 'name');

        if (!assignment) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập' });
        }

        // Check if student is enrolled in this class
        const isEnrolled = await Class.exists({
            _id: assignment.classId,
            students: user._id
        });

        if (!isEnrolled) {
            return res.status(403).json({ message: 'Bạn không có quyền xem bài tập này' });
        }

        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment for student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create new assignment
router.post("/assignments", (req, res) => {
    upload.array("attachments")(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.files || !req.body.classId || !req.body.title) {
            return res.status(400).json({ error: "File, class, and title are required" });
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(decoded._id);

            if (!user || user.role !== "teacher") {
                return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
            }

            const { title, description, dueDate, classId } = req.body;

            const classExists = await Class.findById(classId);

            if (!classExists) {
                return res.status(404).json({ message: "Không tìm thấy lớp học!" });
            }

            // Kiểm tra quyền sở hữu lớp học
            if (classExists.userId.toString() !== user._id.toString()) {
                return res.status(403).json({ message: "Bạn không có quyền tạo bài tập cho lớp học này!" });
            }

            // Create attachment objects from uploaded files
            const attachments = req.files ? req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            })) : [];

            const newAssignment = new Assignment({
                title,
                description,
                dueDate,
                classId,
                attachments
            });

            await newAssignment.save();

            await Class.findByIdAndUpdate(
                classId,
                { $push: { assignments: newAssignment._id } },
                { new: true }
            );
            res.status(201).json(newAssignment);
        } catch (error) {
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads/assignments', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            console.error('Error creating assignment:', error);
            res.status(500).json({ message: 'Error creating assignment', error: error.message });
        }
    });
});

// PUT update assignment
router.put('/assignments/:id', upload.array('attachments'), async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decoded._id);

        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }

        const { title, description, dueDate, classId } = req.body;

        const classExists = await Class.findById(classId);

        if (!classExists) {
            return res.status(404).json({ message: "Không tìm thấy lớp học!" });
        }

        // Kiểm tra quyền sở hữu lớp học
        if (classExists.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền tạo bài tập cho lớp học này!" });
        }

        // Find existing assignment
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Process new attachments if any
        const newAttachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        // Update the assignment
        assignment.title = title;
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.classId = classId;

        // Add new attachments to existing ones if there are any
        if (newAttachments.length > 0) {
            assignment.attachments = [...assignment.attachments, ...newAttachments];
        }

        await assignment.save();
        res.json(assignment);
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
});

// DELETE assignment
router.delete('/assignments/:id', async (req, res) => {
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
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Delete associated files
        assignment.attachments.forEach(attachment => {
            try {
                fs.unlinkSync(attachment.path);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        });

        // Delete the assignment from database
        await Assignment.findByIdAndDelete(req.params.id);

        await Class.findByIdAndUpdate(
            assignment.classId,
            { $pull: { assignments: req.params.id } }
        );

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
});

// DELETE attachment from assignment
router.delete('/assignments/:assignmentId/attachments/:attachmentId', async (req, res) => {
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
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }
        const assignment = await Assignment.findById(req.params.assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Find the attachment
        const attachment = assignment.attachments.id(req.params.attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        // Delete the file
        try {
            fs.unlinkSync(attachment.path);
        } catch (err) {
            console.error('Error deleting file:', err);
        }

        // Remove attachment from assignment
        assignment.attachments.pull(req.params.attachmentId);
        await assignment.save();

        res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Error deleting attachment', error: error.message });
    }
});

// Download attachment
router.get("/download/:assignmentId/attachment/:attachmentId", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the assignment by ID
        const assignment = await Assignment.findById(req.params.assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Find the attachment by ID
        const attachment = assignment.attachments.id(req.params.attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        const filePath = path.join(__dirname, '../uploads/assignments', attachment.filename);
        if (fs.existsSync(filePath)) {
            res.download(filePath, attachment.name, (err) => {
                if (err) {
                    res.status(500).json({ message: "Error when downloading attachment." });
                }
            });
        } else {
            res.status(404).json({ message: "File not found on server!" });
        }
    } catch (error) {
        console.error("Error downloading attachment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;