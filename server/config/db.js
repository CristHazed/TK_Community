const mongoose = require('mongoose');

// Cache the active connection status globally across serverless instances
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Reusing existing database connection pool');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log('Database connected Successfully');
    }
    catch (err) {
        console.error('Error connecting to MongoDB: ', err);
        throw err; // Forward error safely without killing the container runner
    }
};

module.exports = connectDB;