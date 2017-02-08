var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var tenantSchema = new schema({
	tenantName  : String, 
	tenantId	: String, 
	secret		: String
})

module.exports = mongoose.model('tenant', tenantSchema);