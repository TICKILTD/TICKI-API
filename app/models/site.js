var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var tenantSchema = require('./tenant');

var siteSchema = new schema({
	siteDomain  : String,
	path		: String, 

	tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    }
})				

module.exports = mongoose.model('site', siteSchema);