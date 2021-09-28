var express = require('express');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

//  Get Environment Variables
var prefix = process.env.PREFIX;
prefix = (!prefix ? '' : prefix);

//  Add Health Check Endpoint
var health = require('./resources/health.js');

app.use(`${prefix}/healthz`, health);

module.exports = app;
