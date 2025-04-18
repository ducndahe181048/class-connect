const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/User");
const classRoutes = require("./routes/Class");
const uploadRoutes = require("./routes/UploadRoutes");
const authRoutes = require("./routes/AuthRoutes");
const scheduleRoutes = require("./routes/ScheduleRoutes");
const assignmentRoutes = require("./routes/AssignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");
const statisticRoutes = require("./routes/StatisticRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "ClassConnect"
})
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.on("connected", () => console.log("✅ Connected to:", mongoose.connection.db.databaseName));

app.use("/", userRoutes);
app.use("/class", classRoutes);
app.use("/api", uploadRoutes);
app.use("/auth", authRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/assignment", assignmentRoutes);
app.use("/submission", submissionRoutes);
app.use("/statistic", statisticRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

