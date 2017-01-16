var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var questionSchema  = new schema({
	text		: String, 
	validFrom	: Date, 
	validUntil	: Date, 
	culture		: String, 
	uiCulture	: String
});

module.exports = mongoose.model('question', questionSchema);