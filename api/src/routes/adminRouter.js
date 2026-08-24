const express = require('express');
const router = express.Router();

const User = require('../models/Users');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// PUT: Approve a registration
router.put('/users/:id/approve', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.status(200).json({ message: 'User registration approved!', user });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// PUT: Reject a registration
router.put('/users/:id/reject', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.status(200).json({ message: 'User registration rejected!', user });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// OPTIONAL: Update your GET /users route to ONLY load pending applications
router.get('/users', async (req, res) => {
    try {
        // This ensures processed users disappear from the incoming dashboard list
        const users = await User.find({ status: 'pending' });

        res.status(200).json({
            message: 'Pending users retrieved successfully!',
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

router.get('/user-count', async (req, res) => {
  try {
    // ONLY count records waiting for admin review
    const count = await User.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

module.exports = router;