const express = require('express');
const router = express.Router();

const User = require('../models/Users');
const Admin = require('../models/Admins');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Upload image to Cloudinary
const uploadToCloudinary = (file, folder) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder
            },
            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(file.buffer);
    });
};

// Register user
router.post('/register', upload.fields([
        { name: 'inGProfile', maxCount: 1 },
        { name: 'fbProfile', maxCount: 1 }
    ]),

    async (req, res) => {
        try {
            const {
                name,
                IGN,
                UID,
                streamerId,
                FB,
                role,
                referral
            } = req.body;
            
            const targetUID = Number(UID);

            if(isNaN(targetUID)) {
                return res.status(400).json({ error: 'invalid UID Format'})
            }

            const uidExists = await User.exists({ UID: targetUID });
            if (uidExists) {
                return res.status(400).json({ error: 'This UID is already registered.' });
            }
            // Check if both images were uploaded
            if (
                !req.files ||
                !req.files.inGProfile ||
                !req.files.fbProfile
            ) {

                return res.status(400).json({
                    error: 'Both profile images are required.'
                });

            }


            // Get uploaded files
            const gameProfileFile = req.files.inGProfile[0];
            const fbProfileFile = req.files.fbProfile[0];


            // Upload game profile to Cloudinary
            const gameProfileResult = await uploadToCloudinary(
                gameProfileFile,
                'users/game-profile'
            );


            // Upload Facebook profile to Cloudinary
            const fbProfileResult = await uploadToCloudinary(
                fbProfileFile,
                'users/facebook-profile'
            );


            // Create user
            const newUser = new User({

                name: name,
                IGN: IGN,
                UID: targetUID,
                streamerId: streamerId,
                FB: FB,
                role: role,
                referral: referral,

                inGProfile: {
                    url: gameProfileResult.secure_url,
                    public_id: gameProfileResult.public_id
                },

                fbProfile: {
                    url: fbProfileResult.secure_url,
                    public_id: fbProfileResult.public_id
                }

            });


            // Save to MongoDB
            await newUser.save();


            // Send response
            res.status(201).json({

                message: 'User Created Successfully!',

                user: newUser

            });


        } catch (error) {

            console.error('Registration Error:', error);

            res.status(500).json({

                error: 'Server Error',
                message: error.message

            });

        }

    }
);

// Add admin credentials
router.post('/addAdmin', async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        const adminUser = String(username);

        const existAdmin = await Admin.exists({ username: adminUser});
        if(existAdmin) {
            return res.status(400).json({ error: 'This admin is already registered '});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username: username,
            password: hashedPassword
        });


        await newAdmin.save();

        return res.status(201).json({
            message: 'Admin has been added successfully!',
            admin: newAdmin
        });
    } catch (error){
        console.error('Registration Error: ', error);

        res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
});

// AUTHENTICATE ADMIN LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const passwordMatches = await bcrypt.compare(password, admin.password);
        if (!passwordMatches) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            username: admin.username
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error', message: err.message });
    }
});
module.exports = router;