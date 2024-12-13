
// declarations
const cors = require('cors');
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const user = require("./router/user");
const admin = require("./router/admin");
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


// declarations


// methods
dotenv.config();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(errorHandler);
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); 
//methods

//routes

app.get('/', (req, res) => res.status(403).json({ message:"forbidden"}));
app.get('/health', (req, res) => res.status(200).json({status: 'ok', message: 'Application is running',timestamp: new Date().toISOString(), }));

app.use('/api/v1', user);
app.use('/api/v1', admin);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "Route not found",
    timestamp: new Date().toISOString(),
  });
});
app.use(errorHandler);
//routes


module.exports = app;

// helpers


