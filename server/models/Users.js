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
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    role: {
        type: String,
        enum: ['Streamer', 'Casual', 'Competitive']
    },
    referral: {
        type: String,
        required: false
    }
}, { timestamps: true });


userSchema.statics.findLogin = async function(uid, status) {
  return await this.findOne({
    UID: uid,
    status: status
  });
};

module.exports = mongoose.model("User", userSchema);