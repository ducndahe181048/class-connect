const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Not a good idea in production (Every time server starts, this is emptied out)
let refreshTokens = [];

// Create new token
router.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) return res.sendStatus(403);
        const accessToken = generateAccessToken({ _id: user._id });
        res.status(200).json({ accessToken: accessToken });
    });
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

// User logout
router.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});

// User Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) return res.status(400).json({ error: "Missing required fields!" });

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const accessToken = generateAccessToken(user.toJSON());
            const refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            res.status(200).json({ user, accessToken, refreshToken, message: "Signin successfully" });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User signup
router.post("/signup", async (req, res) => {
    try {
        const { fullname, password, email, school, dob, city, username, role, classroom, classId, classes } = req.body;

        if (!fullname || !email || !school || !dob || !city || !username || !role || !password) return res.status(400).json({ error: "Missing required fields!" });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "User already exists!" });

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            fullname, email, school, dob, city, username, role,
            password: hashPassword,
            classroom: role === "student" ? (classroom || null) : undefined,
            classId: role === "student" ? (classId || []) : undefined,
            classes: role === "teacher" ? (classes || []) : undefined,
        });

        const newUser = await user.save();

        // Convert to object and remove unwanted fields for response
        const responseUser = newUser.toObject();
        if (role === "teacher") {
            delete responseUser.classroom;
            delete responseUser.classId;
        } else if (role === "student") {
            delete responseUser.classes;
        }

        res.status(201).json(responseUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send email reset password
const sendResetPasswordEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const user = await User.findOne({ email }).select('-password');

    if (!user) {
        return res.status(404).json({ error: "No user found with this email!" });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Đặt lại mật khẩu của bạn",
        html: `
            <html>
            <body>
                <h1>Yêu cầu đặt lại mật khẩu cho ClassConnect</h1>
                <p>Xin chào <strong>[${user.fullname}]</strong>,</p>
                <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                <a href="http://localhost:3000/reset-password/${token}" style="background-color: #007bff; color: white; padding: 10px; text-decoration: none;">Đặt lại mật khẩu</a>
                <p>Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email.</p>
            </body>
            </html>`,
    };

    await transporter.sendMail(mailOptions);
};

// Forgot password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });

        await sendResetPasswordEmail(email, token);
        res.json({ message: "Reset password email sent!" });
    } catch (error) {
        res.status(500).json({ error: "Error sending email", details: error.message });
    }
});

// Reset password
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(decoded._id, { password: hashedPassword });

        res.json({ message: "Password reset successfully!" });
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired token", message: error.message });
    }
});

// Change password
router.put("/change-password/:id", async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Old password and new password are required" });
    }

    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Validate the new password (e.g., minimum length)
        // if (newPassword.length < 8) {
        //     return res.status(400).json({ message: "New password must be at least 8 characters long" });
        // }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Error changing password", error: error.message });
    }
});

module.exports = router;