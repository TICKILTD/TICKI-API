var ObjectId = require('mongoose').Types.ObjectId;

var queryHelper = {
	
    getSecret : (tenant_id, effectiveOn) => {

		var dt = new Date();
		if (effectiveOn) dt = new Date(effectiveOn);

		var o_id = new ObjectId(tenant_id);

		var secretQuery = {
			tenant_id : o_id,
			validFrom: {
				$lte: dt
			}, 
			$or: [{
					validUntil: null
				 }, 
				 {
				 	validUntil: {
				 		$gte: dt
				 	}
				 }]
			};

		return secretQuery;
	},
	 

	getCurrentQuestions : (culture, uiCulture) => {

		if (!culture) culture = "en_GB";
		if (!uiCulture) uiCulture = "en_GB";

		var now = new Date();

		var currentQuestionsQuery = {
			culture: culture, 
			uiCulture: uiCulture, 
			validFrom: {
				$lte: now
			}, 
			$or: [{
					validUntil: null
				 }, 
				 {
				 	validUntil: {
				 		$gte: now
				 	}
				 }]
			};

		return currentQuestionsQuery;
	}
}

module.exports = queryHelper