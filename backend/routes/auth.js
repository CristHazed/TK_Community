const express = require('express');
const router = express.Router();

const User = require('../models/Users');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

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
                role
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

// AUTHENTICATE LOGIN
router.get('/login/:uid', async (req,res) => {
    try {
        const targetUID = Number(req.params.uid);

        if(isNaN(targetUID)) {
            return res.status(400).json({ error: 'invalid UID Format'})
        }
        
        const user = await User.findLogin(targetUID, 'approved');

        if(!user) {
            return res.status(400).json({ error : 'User not found'})
        }

        return res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server Error', message: err.message }); 
    }
});

module.exports = router;