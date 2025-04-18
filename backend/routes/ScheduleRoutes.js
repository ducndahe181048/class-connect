const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedules');
const Class = require('../models/Classes');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get teacher's schedule for a date range
router.get('/teacher/schedule', async (req, res) => {
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

        // Fix: Corrected the teacher role check
        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }

        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày bắt đầu và kết thúc!' });
        }

        const schedules = await Schedule.find({
            teacher: user._id,
            date: { $gte: start, $lte: end }
        }).sort({ date: 1, start: 1 });

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Get student's schedule for a date range
router.get('/student/schedule', async (req, res) => {
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

        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày bắt đầu và kết thúc!' });
        }

        // Find schedules for the classes the student is enrolled in
        const schedules = await Schedule.find({
            class: { $in: user.classId },
            date: { $gte: start, $lte: end }
        }).sort({ date: 1, start: 1 });

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Create a new schedule event
router.post('/teacher/schedule', async (req, res) => {
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

        // Teacher role check
        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }

        const { title, class: classId, date, start, end, location, description } = req.body;

        // Validate required fields
        if (!title || !classId || !date || !start || !end || !location) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra classId có tồn tại
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({ message: 'Lớp học không tồn tại' });
        }

        // Check for time conflicts
        const existingEvents = await Schedule.find({
            teacher: user._id,
            date: date,
            $or: [
                // New event starts during an existing event
                { start: { $lte: start }, end: { $gt: start } },
                // New event ends during an existing event
                { start: { $lt: end }, end: { $gte: end } },
                // New event completely contains an existing event
                { start: { $gte: start }, end: { $lte: end } }
            ]
        });

        if (existingEvents.length > 0) {
            return res.status(400).json({
                message: 'Thời gian này đã có lịch dạy khác, vui lòng chọn thời gian khác'
            });
        }

        const newSchedule = new Schedule({
            title,
            class: classId,
            date,
            start,
            end,
            location,
            description,
            teacher: user._id
        });

        await newSchedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Update a schedule event
router.put('/teacher/schedule/:id', async (req, res) => {
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

        // Check if the user is a teacher
        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }

        const { title, class: classId, date, start, end, location, description } = req.body;

        // Validate required fields
        if (!title || !classId || !date || !start || !end || !location) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra classId có tồn tại
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({ message: 'Lớp học không tồn tại' });
        }

        // Find the existing schedule
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ message: 'Không tìm thấy lịch giảng dạy' });
        }

        // Check ownership
        if (schedule.teacher.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền cập nhật lịch này' });
        }

        // Check for time conflicts (excluding this event)
        if ((start && start !== schedule.start) || (end && end !== schedule.end)) {
            const existingEvents = await Schedule.find({
                _id: { $ne: req.params.id }, // Exclude the current schedule
                teacher: user._id,
                date: date,
                $or: [
                    // New event starts during an existing event
                    { start: { $lt: end }, end: { $gt: start } },
                    // New event ends during an existing event
                    { start: { $lt: end }, end: { $gte: start } },
                    // New event completely contains an existing event
                    { start: { $gte: start }, end: { $lte: end } }
                ]
            });

            if (existingEvents.length > 0) {
                return res.status(400).json({ message: 'Thời gian này đã có lịch dạy khác, vui lòng chọn thời gian khác' });
            }
        }

        // Update the schedule
        schedule.title = title;
        schedule.class = className;
        schedule.date = date;
        schedule.start = start || schedule.start; // Keep the original start time if not updated
        schedule.end = end || schedule.end; // Keep the original end time if not updated
        schedule.location = location;
        schedule.description = description;

        await schedule.save();
        res.json(schedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Delete a schedule event
router.delete('/teacher/schedule/:id', async (req, res) => {
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

        // Fix: Corrected the teacher role check
        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Người dùng không phải là giáo viên!" });
        }

        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ message: 'Không tìm thấy lịch giảng dạy' });
        }

        // Check ownership
        if (schedule.teacher.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền xóa lịch này' });
        }

        await Schedule.deleteOne({ _id: req.params.id });

        res.json({ message: 'Đã xóa lịch giảng dạy' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;