require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./server/config/db');

const adminRouter = require('./server/routes/adminRouter');
const loginRouter = require('./server/routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Intercept routing flow to verify database link is active before parsing
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Vercel Gateway - Database Connection Error:", error);
    return res.status(500).json({ 
      error: "Database connectivity error", 
      details: error.message 
    });
  }
});

app.use('/api/routes/admin', adminRouter);
app.use('/api/routes/auth', loginRouter);

module.exports = app;