var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var personSchema = new schema({
	externId		: String, 
	firstName   	: String, 
	lastName    	: String, 
	email 			: String, 
	mobNumber		: String, 
	postcode		: String
});

module.exports = mongoose.model('person', personSchema);