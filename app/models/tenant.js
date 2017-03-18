var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var tenantSchema = new schema({
	tenantName  		: String, 
	tenantId			: String, 
	subscriptionId		: String, 

	status				: String, 
	statusDescription 	: String, 
	statusUpdatedOn		: Date
})

module.exports = mongoose.model('tenant', tenantSchema);