// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express');
var bodyParser 	= require('body-parser');
var morgan     	= require('morgan');
var request    	= require('request');
var moment	   	= require('moment');
var mongoose   	= require('mongoose');
//var swagger		= require('swagger-jsdoc');
var fs 			= require('fs');
//var _ 			= require('underscore');

var app        	= express();

// server config
var port     	= process.env.PORT || 8080; 




// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },
  host: 'localhost:3000',
  basePath: '/',
};

/*
// options for the swagger docs
var swaggerOptions = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./app/routes/*.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swagger(swaggerOptions);
*/

// configure app
app.use(morgan('dev')); // log requests to the console

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(allowCrossDomain);

//https://cloud.mongodb.com/v2/587a8047c0c6e3132d5f156d#host/detail/11718443570e1f8b7bfa5a208c5c8a5e/status
mongoose.connect('mongodb://parsonss:Hawk3rHunt3r$@dpaitcluster0-shard-00-00-543ez.mongodb.net:27017,dpaitcluster0-shard-00-01-543ez.mongodb.net:27017,dpaitcluster0-shard-00-02-543ez.mongodb.net:27017/admin?ssl=true&replicaSet=DPAITCluster0-shard-0&authSource=admin'); 







// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'Welcome to the Ticki API' });	
});

// Load all of the other routes
fs.readdirSync('./app/routes').forEach(function(file) {
	console.log('Loading routes from ' + file);
	require('./app/routes/' + file.substr(0, file.indexOf('.')))(router);
});

app.use('/api', router);

// Start the server
app.listen(port);
console.log('Magic happens on port ' + port);
