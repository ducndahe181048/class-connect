const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Document = require("../models/Documents");
const Lesson = require("../models/Lessons");
const Class = require("../models/Classes");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const fs = require("fs");
const path = require("path");
const multer = require('multer');

// Configure storage for document files
const storageFile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/classroom-management/backend/uploads/files');
    },

    filename: function (req, file, cb) {
        // Encode the original filename to handle UTF-8 characters properly
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + "_" + originalName);
    }
});

// Configure storage for video files
const storageVideo = multer.diskStorage({
    destination: function (req, video, cb) {
        cb(null, '/classroom-management/backend/uploads/videos');
    },

    filename: function (req, video, cb) {
        // Encode the original filename to handle UTF-8 characters properly
        const originalName = Buffer.from(video.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + "_" + originalName);
    }
});

const uploadFile = multer({
    storage: storageFile,
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

// Helper function to validate if class exists
async function validateClassExists(classId) {
    const classExists = await Class.findById(classId);
    return classExists ? true : false;
}

// Get documents by classId
router.get("/class/:classId", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const classExists = await Class.findById(req.params.classId);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Kiểm tra quyền truy cập
        const isTeacher = classExists.userId.toString() === user._id.toString();
        const isStudent = classExists.students.includes(user._id);
        if (!isTeacher && !isStudent) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập tài liệu của lớp này!" });
        }

        const documents = await Document.find({ classId: req.params.classId });
        res.json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Upload document with metadata
router.post("/upload", (req, res) => {
    uploadFile.single("file")(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file || !req.body.classId || !req.body.name) {
            return res.status(400).json({ error: "File, name, and classId are required" });
        }

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

            // Validate if class exists
            const classExists = await Class.findById(req.body.classId);
            if (!classExists) {
                const filePath = path.join(__dirname, '../uploads/files', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.status(404).json({ message: "Class not found" });
            }

            // Kiểm tra quyền sở hữu lớp học
            if (classExists.userId.toString() !== user._id.toString()) {
                return res.status(403).json({ message: "Bạn không có quyền tạo bài tập cho lớp học này!" });
            }

            if (req.file.size >= 20 * 1024 * 1024) {
                const filePath = path.join(__dirname, '../uploads/files', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.status(400).send({ message: 'File must be less than 20MB!' });
            }

            const documentData = new Document({
                name: req.body.name,
                description: req.body.description || "",
                filename: req.file.filename,
                path: `/uploads/files/${req.file.filename}`,
                size: req.file.size,
                classId: req.body.classId,
            });

            const savedDocument = await documentData.save();

            // Update Class to include the document
            await Class.findByIdAndUpdate(
                req.body.classId,
                { $push: { documents: savedDocument._id } },
                { new: true }
            );

            res.json(savedDocument);
        } catch (error) {
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads/files', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            console.error("Error saving document:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    });
});

// Update document
router.put("/:id", uploadFile.single("file"), async (req, res) => {
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

        const document = await Document.findById(req.params.id);

        if (!document) {
            // Delete the uploaded file if document doesn't exist
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads/files', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(404).json({ message: "Document not found" });
        }

        // Lưu classId cũ trước khi cập nhật
        const oldClassId = document.classId;

        // Validate if class exists
        const classExists = await Class.findById(req.body.classId);

        if (!classExists) {
            // Delete the uploaded file since the class doesn't exist
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads/files', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(404).json({ message: "Class not found" });
        }

        // Kiểm tra quyền sở hữu lớp học
        if (classExists.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bài tập cho lớp học này!" });
        }

        const updateData = {
            name: req.body.name,
            description: req.body.description || "",
            classId: req.body.classId,
        };

        // If a new file was uploaded, update file information
        if (req.file) {
            // Delete old file if exists
            const oldFilePath = path.join(__dirname, "../uploads/files", document.filename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Update with new file info
            updateData.filename = req.file.filename;
            updateData.path = `/uploads/files/${req.file.filename}`;
            updateData.size = req.file.size;
        }

        const updatedDocument = await Document.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // Kiểm tra xem classId có thay đổi không và cập nhật mảng documents của các lớp
        if (oldClassId.toString() !== req.body.classId) {
            // Xóa tài liệu khỏi mảng documents của lớp cũ
            await Class.findByIdAndUpdate(
                oldClassId,
                { $pull: { documents: document._id } }
            );
            // Thêm tài liệu vào mảng documents của lớp mới
            await Class.findByIdAndUpdate(
                req.body.classId,
                { $addToSet: { documents: document._id } } // Sử dụng $addToSet để tránh trùng lặp
            );
        }

        res.json(updatedDocument);
    } catch (error) {
        // Delete the uploaded file if there's an error
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads/files', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        console.error("Error updating document:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Download document
router.get("/download/:id", async (req, res) => {
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

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const filePath = path.join(__dirname, '../uploads/files', document.filename);

        if (fs.existsSync(filePath)) {
            res.download(filePath, document.name, (err) => {
                if (err) {
                    res.status(500).json({ message: "Error when downloading file." });
                }
            });
        } else {
            res.status(404).json({ message: "File not found on server!" });
        }
    } catch (error) {
        console.error("Error downloading document:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete document
router.delete("/:id", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id);
        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can delete documents" });
        }

        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the physical file
        const filePath = path.join(__dirname, "../uploads/files", document.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn(`File not found: ${filePath}`);
        }

        // Delete the document record from database
        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;