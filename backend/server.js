require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const connectDB = require('./config/db');

const registerRouter = require('./routes/adminRouter');
const loginRouter = require('./routes/auth');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.use('/api/', registerRouter);
app.use('/api/' , loginRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});