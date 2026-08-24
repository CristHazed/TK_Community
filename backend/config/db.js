const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
            console.log('Database connected Successfully');
    }
    catch (err) {
        console.error('Error connecting to MongoDB: ', err);
        process.exit(1);
    }
};

module.exports = connectDB;