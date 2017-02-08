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
var secret		= require('./app/models/secret');

// utils
var query		= require('./app/utils/queryHelper');
var crypto		= require('./app/utils/securityHelper');

// server config
var port     	= process.env.PORT || 8080; 

var ObjectId 	= mongoose.Types.ObjectId;


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
	res.json({ message: 'hooray! welcome to our api!' });	
});

// Get all questions
router.route('/questions')
	.get(function(req, res) {

		var currentQuestionsQuery = query.getCurrentQuestions(req.params.culture, req.query.uiCulture);

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

// Get all tenants
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

// Get all tenants
router.route('/secrets')
	.get(function(req, res) {
		secret.find({})
			  .exec(function(err, t) {
			  		if (!err) {
			  			res.json(t);
			  		}
			  		else {
			  			res.status(500).send('Something went wrong');
			  		}
			   });		
	});

// Get a specific tenant
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
	})


router.route('/tenants/:tenant_id/secret')
	.get(function(req, res) {

		var secretQuery = query.getSecret(req.params.tenant_id, req.query.date);

		secret.find(secretQuery, (err, s) => {
				if (!err) {
					if (s) {
						res.json(s)
					}
					else {
						res.status(404).send('No valid secret found');
					}
				}
				else {
					res.status(500).send('Something went wrong');
				}
		});
	})

	.post(function(req, res) {

		var dt = new Date();

		var secretQuery = query.getSecret(req.params.tenant_id, dt);

		// And create a new secret
		var newSecret = new secret({
			validFrom 	: dt, 
			validUntil	: null, 
			secret		: req.body.secret, 
			tenant_id	: req.params.tenant_id
		});

		secret.findOne(secretQuery)
			  .exec(function(err1, s1) {
				if (!err1 && s1) {

					// Set the valid until date on the old secret
					s1.validUntil = dt;

					s1.save(function(err2, s2) {
						
						console.log("Previous secret has been terminated");

						newSecret.save(newSecret, function(err3, s3) {
							console.log("New secret has been saved");
						})
					});
				}
				else {
					console.log("No previous secret has been created");

					newSecret.save(newSecret, function(err3, s3) {
						console.log("New secret has been saved");
					})
				}
			  });
	})

// Get an existing submission
router.route('/tenants/:tenant_id/submissions/:id')

	// get the bear with that id
	.get(function(req, res) {

		// The id is a valid MongoDB object id, so include this in the query
		var query = {
			'site.tenant_id' : req.params.tenant_id,
			token			 : req.params.id
		}
		
		submission.findOne(query, function(err, submission) {
			if (!err && submission) {
				res.json(submission);
			}
			else {
				if (err) {
					res.status(500).send('Something went wrong');
				}
				else {
					res.status(404).send('No submission was found for the tenant and id provided.');	
				}
			}
		});
	})

	// update the bear with this id
	.put(function(req, res) {

		// The id is a valid MongoDB object id, so include this in the query
		var query = {
			'site.tenant_id' : req.params.tenant_id,
			token			 : req.params.id
		}
		
		submission.findOne(query, function(err, submission) {
			if (!err && submission) {
				
				// TODO Update the answers
				// Save
				// Trigger web hook?

			}
			else {
				if (err) {
					res.status(500).send('Something went wrong');
				}
				else {
					res.status(404).send('No submission was found for the tenant and id provided.');	
				}
			}
		});
	});


// Create a new submission
router.route('/tenants/:tenant_id/submissions')

	.post(function(req, res) {

		tenant.findOne({ tenantId : req.params.tenant_id })
			.exec(function(err, t) {

				if (!err) {
					if (t) {

						// Obtain the secret user to encrypt the submission ids
						var secretQuery = query.getSecret(t.id);

						secret.findOne(secretQuery, (err, sec) => {
							if (!err) {
								if (sec) {
									var newId = new ObjectId();

									var sub = new submission({
										_id: newId, 
										timestamp : new Date(), 
										token: crypto.encrypt({ t: t.id, s: newId }, sec.secret),
										site : new site({
											tenant_id	: t.id, 
											siteDomain  : req.body.site_domain, 
											path 		: req.body.site_path
										}), 
										person : new person({
											externId 	: req.body.contact_externId,
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
										console.log(err);

										if (!err) {
											res.json({submission_id: s.token});	
										}
										else {
											res.status(500).send('Something went wrong');		
										}
									});
								}
								else {
									res.status(404).send('No secret could be found');	
								}
							}
							else {
								res.status(500).send('Somethign went wrong');
							}
						});
					}
					else {
						res.status(404).send('No tenant exists with the specified id');	
					}
				}
				else {
					res.status(500).send('Something went wrong');
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


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
