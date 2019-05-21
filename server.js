const fs = require("fs");
const http = require("http");
const path = require("path");
const methods = require("methods");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const errorhandler = require("errorhandler");
const mongoose = require('mongoose');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';
const appConfig = require('./config/env.json')[nodeEnv];

const app = express();
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'somethingshouldbehere', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) { app.use(errorhandler()); }
mongoose.connect(appConfig["MONGO_URI"], appConfig["MONGO_OPTIONS"]);
mongoose.set('useCreateIndex', true);
if(isDevelopment) { mongoose.set('debug', true); }

// Data models
require('./app/models/user');
require('./app/models/todolist');
require('./app/models/todolisttask');
require('./app/config/passport');
app.use(require('./app/routes'));

/// HTTP ERROR 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ status: 404,
    message: "Not found", statusMessage: "error",
    errors: { content: "Not found" } });
  next();
});

// Development Error Handler
if (!isProduction) {
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ status: 500,
      message: "Internal error", statusMessage: "error",
      errors: { api: "Internal error" } });
  });
}

// Production Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ status: 500,
    message: "Internal error", statusMessage: "error",
    errors: { api: "Internal error" } });
});

// Start server
const server = app.listen(process.env.PORT || appConfig["PORT"], () => {
  console.log("Starting server ... ;)");
  console.log('NODE_ENV=' + nodeEnv);
  console.log('Listening on port ' + server.address().port);
});

module.exports = server;
