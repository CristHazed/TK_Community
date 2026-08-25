const express = require('express');
const router = express.Router();

const User = require('../models/Users');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const verifyToken = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Every route below requires a valid Authorization: Bearer <token> header
router.use(verifyToken);

// GET: Pending applications
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ status: 'pending' });

        res.status(200).json({
            message: 'Pending users retrieved successfully!',
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// GET: Approved roster + streamers (split client-side by role)
router.get('/users/approved', async (req, res) => {
    try {
        const users = await User.find({ status: 'approved' });

        res.status(200).json({
            message: 'Approved users retrieved successfully!',
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// PUT: Approve a registration (sets roster version chosen by admin)
router.put('/users/:id/approve', async (req, res) => {
    try {
        const { version } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                version: version === 'v2' ? 'v2' : 'v1',
                joinedAt: new Date()
            },
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

// PUT: Kick a member out (soft delete — keeps the record, marks it removed)
router.put('/users/:id/kick', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'removed', removedAt: new Date() },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User removed from roster.', user });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// PUT: Edit a roster member's basic info
router.put('/users/:id', async (req, res) => {
    try {
        const { ign, role, version } = req.body;

        const update = {};
        if (ign !== undefined) update.IGN = ign;
        if (role !== undefined) update.role = role;
        if (version !== undefined) update.version = version === 'v2' ? 'v2' : 'v1';

        const user = await User.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User updated successfully!', user });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// PUT: Edit streamer-specific info
router.put('/users/:id/streamer', async (req, res) => {
    try {
        const {
            ign,
            username,
            tiktokName,
            following,
            followers,
            tiktokUrl,
            details,
            streamerImage
        } = req.body;

        const update = {};
        if (ign !== undefined) update.IGN = ign;
        if (username !== undefined) update.username = username;
        if (tiktokName !== undefined) update.tiktokName = tiktokName;
        if (following !== undefined) update.following = Number(following) || 0;
        if (followers !== undefined) update.followers = Number(followers) || 0;
        if (tiktokUrl !== undefined) update.tiktokUrl = tiktokUrl;
        if (details !== undefined) update.details = details;
        if (streamerImage) update.streamerImage = streamerImage; // only overwrite if a new one was uploaded

        const user = await User.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'Streamer updated successfully!', user });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', message: error.message });
    }
});

// Get user counts with pending application
router.get('/user-count', async (req, res) => {
  try {
    const count = await User.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

module.exports = router;