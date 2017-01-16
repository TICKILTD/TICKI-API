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

// on routes that end in /bears
// ----------------------------------------------------
router.route('/submissions')
	
	.get(function(req, res) {

		var submission = new submission(); 
		
		submission.site = new site();
		submission.site.site_id = "TonikEnergy";
		submission.site.siteDomain = "TonikEnergy.com";

		submission.person = new person();
		submission.person.firstName = "Simon"
		submission.person.lastName = "Parsons"

		var a1 = new answer();
		a1.question_id = 1;
		a1.value = true;

		var a2 = new answer();
		a2.question = "Do you not have a problem if we dont not sell you to none of our pimps?";
		a2.value = false;

		submission.answers = [a1, a2]

		submission.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'submission created!' });
		});

	})

	.post(function(req, res) {
		
		var submission = new submission(); 
		
		submission.site = new site();
		submission.site.site_id = req.body.site.site_id;
		submission.site.siteDomain = req.body.site.siteDomain;

		submission.person = new person();
		submission.person.firstName = req.body.person.firstName;
		submission.person.lastName = req.body.person.lastName;

		var a1 = new answer();
		a1.question = req.body.answers[0].question;
		a1.value = req.body.answers[0].value;

		var a2 = new answer();
		a2.question = req.body.answers[1].question;
		a2.value = req.body.answers[1].value;

		submission.answers = [a1, a2]

		submission.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'submission created!' });
		});
	})

	.get(function(req, res) {
		submission.find(function(err, submissions) {
			if (err)
				res.send(err);

			res.json(submissions);
		});
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
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
