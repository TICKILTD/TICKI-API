var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var answerSchema = new schema({
	
	question_id :  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'question'
    }, 

	value : Boolean
})

module.exports = mongoose.model('answer', answerSchema);