var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

var secretSchema = new schema({
	validFrom    : Date,
	validUntil   : Date,
    secret       : String,  
    tenant_id    : String, 

	tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    }
})				

module.exports = mongoose.model('secret', secretSchema);