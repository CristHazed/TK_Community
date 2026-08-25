require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const connectDB = require('./server/config/db');

const adminRouter = require('./server/routes/adminRouter');
const loginRouter = require('./server/routes/auth');

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

app.use('/api/routes/admin', adminRouter);
app.use('/api/routes/auth', loginRouter);

module.exports = app;