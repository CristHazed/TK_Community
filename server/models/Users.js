const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    IGN: {
        type: String,
        required: true
    },
    UID: {
        type: Number,
        required: true
    },
    streamerId: {
        type: String,
        required: true
    },
    inGProfile: {
        url: String,
        public_id: String
    },
    fbProfile: {
        url: String,
        public_id: String
    },
    FB: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'removed'],
        default: 'pending'
    },
    role: {
        type: String,
        enum: ['Streamer', 'Casual', 'Competitive'],
        default: 'Casual'
    },
    referral: {
        type: String,
        required: false
    },
    version: {
        type: String,
        enum: ['v1', 'v2'],
        default: 'v1'
    },
    joinedAt: {
        type: Date
    },
    removedAt: {
        type: Date
    },
    // Streamer-only fields (edited via the Streamers admin tab)
    username: { type: String },        // TikTok handle, e.g. "@name"
    tiktokName: { type: String },
    tiktokUrl: { type: String },
    following: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    details: { type: String },
    streamerImage: { type: String }

}, { timestamps: true });


userSchema.statics.findLogin = async function(uid, status) {
  return await this.findOne({
    UID: uid,
    status: status
  });
};

module.exports = mongoose.model("User", userSchema);