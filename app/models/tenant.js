var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var tenantSchema = new schema({
	tenantName  		: String, 
	tenantId			: String, 
	secret				: String, 

	status				: String, 
	statisDescription 	: String, 
	statusUpdatedOn		: String
})

module.exports = mongoose.model('tenant', tenantSchema);