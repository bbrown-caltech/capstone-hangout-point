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

//  Add swagger UI
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger/swagger.json');

//  Get Environment Variables
var prefix = process.env.PREFIX;
var swaggerUrl = process.env.SWAGGER_SERVER_URL;

prefix = (!prefix ? '' : prefix);
swaggerUrl = (!swaggerUrl ? 'http://localhost:3000' : swaggerUrl);

swaggerDocument.servers = [{'url': swaggerUrl}];

app.use(`${prefix}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//  Add Health Check Endpoint
var health = require('./resources/health.js');

app.use(`${prefix}/healthz`, health);


//  Add Scheduling Manager Endpoints
var scheduler = require('./resources/schedule.js');

app.use(`${prefix}/schedule`, scheduler);


app.listen(3000);
