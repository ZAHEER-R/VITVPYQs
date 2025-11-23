const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Paper = require('../models/Paper');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware to get user ID
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// Upload Paper
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
    try {
        const { subject, courseCode, examYear, examName, category } = req.body;

        const newPaper = new Paper({
            subject,
            courseCode,
            examYear,
            examName,
            category,
            filePath: req.file.path,
            uploader: req.user.id
        });

        await newPaper.save();

        // Update User Points
        const user = await User.findById(req.user.id);
        user.points += 50;

        // Update Level
        if (user.points >= 4000) user.level = 'Legendary';
        else if (user.points >= 3000) user.level = 'Diamond';
        else if (user.points >= 2000) user.level = 'Gold';
        else if (user.points >= 1000) user.level = 'Silver';

        await user.save();

        res.json(newPaper);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Search Papers
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        // Simple regex search for now
        const papers = await Paper.find({
            $or: [
                { subject: { $regex: query, $options: 'i' } },
                { courseCode: { $regex: query, $options: 'i' } },
                { examName: { $regex: query, $options: 'i' } }
            ]
        }).populate('uploader', 'firstName lastName profilePic');

        res.json(papers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
