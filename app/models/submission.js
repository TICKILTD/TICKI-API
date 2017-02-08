var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var siteSchema   = require('./site');
var personSchema = require('./person');
var answerSchema = require('./answer');

var submissionSchema  = new schema({
	id		 	: Number,
	timestamp	: Date, 
	token		: String, 
	
	site        : siteSchema.schema,  
	person 		: personSchema.schema,
	answer      : [answerSchema.schema]
});

module.exports = mongoose.model('submission', submissionSchema);