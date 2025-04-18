const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submissions');
const Assignment = require('../models/Assignments');
const Class = require('../models/Classes');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');

// Configure storage for submission files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/classroom-management/backend/uploads/submissions');
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

// GET all submissions for a student
router.get('/student', async (req, res) => {
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

        const submissions = await Submission.find({ studentId: user._id })
            .sort({ submittedAt: -1 })
            .populate('assignmentId', 'title dueDate');

        res.json(submissions);
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST - Submit an assignment
router.post('/submissions', upload.single('submissionFile'), async (req, res) => {
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
            return res.status(403).json({ message: "Chỉ học viên mới có thể nộp bài!" });
        }

        const { assignmentId } = req.body;

        if (!assignmentId) {
            return res.status(400).json({ message: "Thiếu thông tin bài tập!" });
        }

        // Check if assignment exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Không tìm thấy bài tập!" });
        }

        // Check deadline if assignment has one
        if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({ message: "Đã quá hạn nộp bài!" });
        }

        // Check if student has already submitted
        const existingSubmission = await Submission.findOne({
            assignmentId,
            studentId: user._id
        });

        // Create file object from uploaded file
        let fileData = null;
        if (req.file) {
            fileData = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            };
        } else {
            return res.status(400).json({ message: "Không có file được tải lên!" });
        }

        if (existingSubmission) {
            // Delete old file from the file system
            if (existingSubmission.files && existingSubmission.files.length > 0) {
                const oldFilePath = existingSubmission.files[0].path;
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (err) {
                    console.error('Error deleting old file:', err);
                }
            }

            // Replace the old file with the new one
            existingSubmission.files = fileData;
            existingSubmission.status = "Submitted";
            existingSubmission.submissionDate = Date.now();

            await existingSubmission.save();
            return res.json(existingSubmission);
        } else {
            // Create a new submission
            const newSubmission = new Submission({
                assignmentId,
                studentId: user._id,
                files: fileData,
                status: "Submitted",
                submissionDate: Date.now()
            });

            await newSubmission.save();
            return res.status(201).json(newSubmission);
        }
    } catch (error) {
        console.error('Error submitting assignment:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Error submitting assignment', error: error.message });
    }
});

// GET - Get a student's submission for an assignment
router.get('/submissions/:assignmentId', async (req, res) => {
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

        const submission = await Submission.findOne({
            assignmentId: req.params.assignmentId,
            studentId: user._id
        });

        if (!submission) {
            return res.status(404).json({ message: "Không tìm thấy bài nộp!" });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Error fetching submission', error: error.message });
    }
});

// Download submission attachment
router.get("/download/:submissionId/attachment/:attachmentId", async (req, res) => {
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

        // Find the submission by ID
        const submission = await Submission.findById(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài nộp!' });
        }

        // Check if the user is authorized to access this submission
        // For student: can only access their own submissions
        // For teacher: can access if they teach the class related to the assignment
        if (user.role === "student" && submission.studentId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xem bài nộp này!" });
        } else if (user.role === "teacher") {
            const assignment = await Assignment.findById(submission.assignmentId);
            if (!assignment) {
                return res.status(404).json({ message: "Không tìm thấy bài tập!" });
            }

            const isTeacher = await Class.exists({
                _id: assignment.classId,
                teacher: user._id
            });

            if (!isTeacher) {
                return res.status(403).json({ message: "Bạn không phải giáo viên của lớp này!" });
            }
        }

        // Find the attachment by ID
        const attachment = submission.attachments.id(req.params.attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: 'Không tìm thấy tệp đính kèm!' });
        }

        const filePath = path.join(__dirname, '../uploads/submissions', attachment.filename);
        if (fs.existsSync(filePath)) {
            res.download(filePath, attachment.originalName || attachment.filename, (err) => {
                if (err) {
                    res.status(500).json({ message: "Lỗi khi tải xuống tệp đính kèm." });
                }
            });
        } else {
            res.status(404).json({ message: "Không tìm thấy tệp trên máy chủ!" });
        }
    } catch (error) {
        console.error("Error downloading attachment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// DELETE - Delete a file from submission
router.delete('/submissions/:submissionId/files/:fileId', async (req, res) => {
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
            return res.status(403).json({ message: "Không có quyền xóa file!" });
        }

        const submission = await Submission.findById(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({ message: "Không tìm thấy bài nộp!" });
        }

        // Check if the submission belongs to the current student
        if (submission.studentId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Không có quyền xóa file này!" });
        }

        // Find the file
        const file = submission.files.id(req.params.fileId);

        if (!file) {
            return res.status(404).json({ message: "Không tìm thấy file!" });
        }

        // Delete the file from storage
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Error deleting file:', err);
        }

        // Remove file from submission
        submission.files.pull(req.params.fileId);
        await submission.save();

        res.json({ message: "File đã được xóa thành công!" });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
});

// Download submission file
router.get("/download/submission/:submissionId/file/:fileId", async (req, res) => {
    try {
        // Find the submission by ID
        const submission = await Submission.findById(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài nộp!' });
        }

        // Find the file by ID
        const file = submission.files.id(req.params.fileId);

        if (!file) {
            return res.status(404).json({ message: 'Không tìm thấy file!' });
        }

        const filePath = path.join(__dirname, '../uploads/submissions', file.filename);
        if (fs.existsSync(filePath)) {
            res.download(filePath, file.originalName, (err) => {
                if (err) {
                    res.status(500).json({ message: "Lỗi khi tải file." });
                }
            });
        } else {
            res.status(404).json({ message: "Không tìm thấy file trên server!" });
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET all submissions (for teachers)
router.get('/teacher/submissions', async (req, res) => {
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

        // Get classes taught by this teacher
        const classes = await Class.find({ userId: user._id });
        const classIds = classes.map(cls => cls._id);

        // Get assignments for these classes
        const assignments = await Assignment.find({ classId: { $in: classIds } });
        const assignmentIds = assignments.map(assignment => assignment._id);

        // Get submissions for these assignments
        const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
            .populate('assignmentId', 'title dueDate classId')
            .populate('studentId', 'fullname email');

        res.json(submissions);
    } catch (error) {
        console.error('Error fetching teacher submissions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET all submissions for a specific assignment (for teachers)
router.get('/teacher/submissions/assignment/:assignmentId', async (req, res) => {
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

        // Check if assignment exists
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Không tìm thấy bài tập!" });
        }

        // Check if teacher is authorized to view this assignment's submissions
        const isTeacher = await Class.exists({
            _id: assignment.classId,
            teacher: user._id
        });

        if (!isTeacher) {
            return res.status(403).json({ message: "Bạn không phải là giáo viên của lớp này!" });
        }

        // Get submissions for this assignment
        const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
            .populate('studentId', 'fullname email');

        res.json(submissions);
    } catch (error) {
        console.error('Error fetching assignment submissions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST - Grade a submission
router.post('/teacher/grade/:submissionId', async (req, res) => {
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
            return res.status(403).json({ message: "Chỉ giáo viên mới có thể chấm điểm!" });
        }

        const { score, feedback } = req.body;
        const submission = await Submission.findById(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({ message: "Không tìm thấy bài nộp!" });
        }

        // Check if teacher is authorized to grade this submission
        const assignment = await Assignment.findById(submission.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Không tìm thấy bài tập!" });
        }

        const isTeacher = await Class.exists({
            _id: assignment.classId,
            userId: user._id
        });

        if (!isTeacher) {
            return res.status(403).json({ message: "Bạn không phải là giáo viên của lớp này!" });
        }

        // Update submission with grade and feedback
        submission.score = score;
        submission.feedback = feedback;

        if (submission.score || submission.feedback) {
            submission.status = 'Graded';
        } else {
            submission.status = 'Submitted';
        }


        await submission.save();

        res.json(submission);
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Error grading submission', error: error.message });
    }
});

module.exports = router;