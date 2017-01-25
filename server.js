// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express');
var bodyParser 	= require('body-parser');
var app        	= express();
var morgan     	= require('morgan');
var request    	= require('request');
var moment	   	= require('moment');
var mongoose   	= require('mongoose');
var _ 			= require('underscore');

// models
var question    = require('./app/models/question');
var submission 	= require('./app/models/submission');
var tenant 		= require('./app/models/tenant');
var site        = require('./app/models/site');
var person		= require('./app/models/person');
var answer      = require('./app/models/answer');

// server config
var port     	= process.env.PORT || 8080; 

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

https://cloud.mongodb.com/v2/587a8047c0c6e3132d5f156d#host/detail/11718443570e1f8b7bfa5a208c5c8a5e/status
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
	res.json({ message: 'hooray! welcome to our api!' });	
});

// Get all questions
router.route('/questions')
	.get(function(req, res) {

		console.log("Obtaining the current list of questions");

		var culture = req.query.culture;
		if (!culture) culture = "en_GB";

		var uiCulture = req.query.uiCulture;
		if (!uiCulture) uiCulture = "en_GB";

		var now = new Date();

		var currentQuestionsQuery = {
			culture: culture, 
			uiCulture: uiCulture, 
			validFrom: {
				$lte: now
			}, 
			$or: [{
					validUntil: null
				 }, 
				 {
				 	validUntil: {
				 		$gte: now
				 	}
				 }]
			};

		question.find(currentQuestionsQuery)
				.exec(function(err, q) {

				 	if (!err) {
				 		res.json(q);	
				 	}
				 	else {
				 		res.status(500).send('Something went wrong');
				 	}
				});
	})

router.route('/tenants')
	.get(function(req, res) {
		tenant.find({})
			  .exec(function(err, t) {
			  		if (!err) {
			  			res.json(t);
			  		}
			  		else {
			  			res.status(500).send('Something went wrong');
			  		}
			   });		
	});

router.route('/people')
	.get(function(req, res) {
		person.find({})
			  .exec(function(err, t) {
			  		if (!err) {
			  			res.json(t);
			  		}
			  		else {
			  			res.status(500).send('Something went wrong');
			  		}
			   });		
	});

router.route('/sites')
	.get(function(req, res) {
		site.find({})
			  .exec(function(err, t) {
			  		if (!err) {
			  			res.json(t);
			  		}
			  		else {
			  			res.status(500).send('Something went wrong');
			  		}
			   });		
	});

router.route('/tenants/:tenant_id')
	.get(function(req, res) {

		var tenantQuery = {
			tenantId : req.params.tenant_id
		};

		tenant.findOne(tenantQuery)
			  .exec(function(err, t) {
			  		if (!err) {
			  			res.json(t);
			  		}
			  		else {
			  			res.status(404).send('Tenant not found');
			  		}
			   });
	});

// Create a new submission
router.route('/submissions')

	.get(function(req, res) {

		submission.find({})
			  .exec(function(err, t) {
			  		if (!err) {
			  			res.json(t);
			  		}
			  		else {
			  			res.status(500).send('Something went wront');
			  		}
			   });		
	})
	
	.post(function(req, res) {

		console.log("Posting new submission");
		
		var tenantQuery = {
			tenantId : req.body.tenant_id
		};

		tenant.findOne(tenantQuery)
			  .exec(function(err, t) {

				 	if (t) {

						var sub = new submission({
							timestamp : new Date(), 
							site : new site({
					 			tenant_id	: t.id, 
					 			siteDomain  : req.body.site_domain, 
					 			path 		: req.body.site_path
					 		}), 
					 		person : new person({
						 		externId 	: req.body.externId,
								firstName 	: req.body.contact_firstName,
								lastName 	: req.body.contact_lastName,
								email 		: req.body.contact_email,
								mobNumber 	: req.body.contact_mobNumber,
								postcode 	: req.body.contact_postcode		
					 		}), 
					 		answer : _.map(req.body.answers, function(a) {
					 			return new answer({
					 				question_id : a.question_id, 
					 				value : a.answer
					 			})
					 		})
					 	});

						sub.save(function(err, s) {
							console.log(s);
							if (!err) {
								res.json({submission_id: s.id});	
							}
							else {
								res.status(500).send('Something went wrong');		
							}
						});
				 	}
				 	else {
				 		res.status(404).send('Tenant Id Not Found');
				 	}
				 	
				});


	})

// Get an existing submission
router.route('/submissions/:submission_id')

	// get the bear with that id
	.get(function(req, res) {
		submission.findById(req.params.submission_id, function(err, submission) {
			if (err)
				res.send(err);
			res.json(submission);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		submission.findById(req.params.submission_id, function(err, submission) {

			if (err)
				res.send(err);

			/*submission.value = req.body.value;
			answer.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Answer updated!' });
			});
			*/

		});
	});
	

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
