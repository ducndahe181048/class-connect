const express = require("express");
const router = express.Router();
const User = require("../models/Users");
require('dotenv').config();

// Get user profile by username
router.get("/profile/:username", async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.username }, "-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
        console.log("✅ User found:", user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route to Get All Users
router.get("/user", async (req, res) => {
    try {
        const users = await User.find();
        console.log("📌 Users Data:", users);
        res.json(users);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
});

//Modify user information (except password, username)
router.put("/user/:id", async (req, res) => {
    try {
        const userFound = await User.findById(req.params.id);
        if (!userFound) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate email if email is being updated
        if (req.body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
        }

        // Update fields only if they are provided
        userFound.fullname = req.body.fullname || userFound.fullname;
        userFound.email = req.body.email || userFound.email;
        userFound.school = req.body.school || userFound.school;
        userFound.classroom = req.body.classroom || userFound.classroom;
        userFound.city = req.body.city || userFound.city;
        userFound.dob = req.body.dob || userFound.dob;

        const updatedUser = await userFound.save();

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
});

//User delete
router.delete("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("Error: User not found!");
        }

        await user.deleteOne();
        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).send("Error: " + error);
    }
});

// Get Specific User
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        console.log("User Data:", student);
        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
});

module.exports = router;