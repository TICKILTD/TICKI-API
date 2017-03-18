var moment = require('moment');
var axios = require('axios');

module.exports = function(router){

    // Get all tenants
    router.route('/chargify/subscription/status')
        .post((req, res) => {

            if (req.body && req.body.event == 'subscription_state_change') {

                var payload = req.body.payload;

                if (payload && 
                    payload.subscription && 
                    payload.subscription.customer) {

                    var tenantId = payload.subscription.customer.reference;

                    if (tenantId) {

                        var status = "";
                        var statusDescroption = "";
                        var statusUpdatedOn = "";
                        
                        switch (payload.subscription.state) {
                            // live state
                            case "trialing" :

                                var trialStarted = moment(payload.subscription.trial_started_at);

                                status = 'trial';
                                statusDescription = "Your trial started on " + trialStarted.fromNow();
                                statusUpdatedOn = payload.updated_at;

                                break;

                            case "active" :  
                                
                                status = 'live';
                                statusDescription = "";
                                statusUpdatedOn = payload.updated_at;

                                break;

                            // member is in the dunning process
                            case "past_due" : 

                                status = 'arrears';
                                statusDescription = "There is an amount due on your account.";
                                statusUpdatedOn = payload.updated_at;

                                break;

                            // attempts to get the member to pay have failed
                            case "unpaid" : 

                                status = 'suspended';
                                statusDescription = "The account has been suspended.";
                                statusUpdatedOn = payload.updated_at;

                                break;

                            // came to the end of a trial period with no payment method on file
                            case "trial_ended" :

                                var trialEnded = moment(payload.subscription.trial_ended_at);

                                status = 'suspended';
                                statusDescription = "Your trial period came to an end " + trialStarted.fromNow();
                                statusUpdatedOn = payload.updated_at;

                                break;

                            // no longer live
                            case "canceled" : 
                            case "expired" : 

                                status = 'cancelled';
                                statusDescription = "Your membership has been cancelled";
                                statusUpdatedOn = payload.updated_at;

                                break;
                        }

                        if (status) {

                            axios
                                .put('http://localhost:8080/api/tenants/:tenantId/status'.replace(":tenantId", tenantId), 
                                {
                                    status : status, 
                                    statusDescription : statusDescription, 
                                    statusUpdatedOn : statusUpdatedOn
                                })
                                .then((response) => {
                                    res.status(200).send("Ok");
                                })
                                .catch((error) => { 
                                    res.error(error);
                                });
                        }
                    }
                }
            }
        })
}
