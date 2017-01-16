var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var personSchema = new schema({
	firstName   : String, 
	lastName    : String
});

module.exports = mongoose.model('person', personSchema);