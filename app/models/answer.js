var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var answerSchema = new schema({
	question_id    	: Number, 
	value       	: Boolean
})

module.exports = mongoose.model('answer', answerSchema);