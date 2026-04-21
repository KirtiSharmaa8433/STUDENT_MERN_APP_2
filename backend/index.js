const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

/* ===========================
   MongoDB Connection
=========================== */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

/* ===========================
   Student Schema
=========================== */
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

/* ===========================
   Auth Middleware
=========================== */
const authMiddleware = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token" });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // { id: ... }

        next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

/* ===========================
   Routes
=========================== */

/* 🔹 Register */
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, course } = req.body;

        if (!name || !email || !password || !course) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            name,
            email,
            password: hashedPassword,
            course
        });

        await newStudent.save();

        res.status(201).json({ message: "Registration successful" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* 🔹 Login */
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: student._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                course: student.course
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* 🔹 Get Dashboard */
app.get("/api/dashboard", authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select("-password");

        res.json({
            message: "Dashboard data",
            student
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* 🔹 Update Password */
app.put("/api/update-password", authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const student = await Student.findById(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        student.password = hashedPassword;

        await student.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* 🔹 Update Course */
app.put("/api/update-course", authMiddleware, async (req, res) => {
    try {
        const { course } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.user.id,
            { course },
            { new: true }
        ).select("-password");

        res.json({
            message: "Course updated successfully",
            student
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* ===========================
   Server Start
=========================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});