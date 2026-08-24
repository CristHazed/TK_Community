require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const connectDB = require('./src/config/db');

const registerRouter = require('./src/routes/adminRouter');
const loginRouter = require('./src/routes/auth');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection error", details: error.message });
  }
});

app.use('/api/', registerRouter);
app.use('/api/' , loginRouter);

module.exports = app;