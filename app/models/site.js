var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var siteSchema = new schema({
	site_id   : String, 
	siteDomain  : String
})

module.exports = mongoose.model('site', siteSchema);