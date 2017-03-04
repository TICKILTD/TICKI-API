var tenant 		= require('../models/tenant');
var secret		= require('../models/secret');

var queryHelper = require('../utils/queryHelper');
var crypto		= require('../utils/securityHelper');

var objectId 	= require('mongoose').Types.ObjectId;

module.exports = function(router){

    // Get all tenants
    router.route('/tenants')
        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .get((req, res) => {
            tenant.find({})
                .exec(function(err, t) {
                        if (!err) {
                            res.json(t);
                        }
                        else {
                            res.status(500).send('Something went wrong');
                        }
                });		
        })

        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .post((req, res) => {

            var dt = new Date()

            var newTenant = new tenant({
                
                tenantName  		: req.body.name,
                tenantId             : req.body.tenantId, 
                status              : 'trial', 
                statusDescription   : '', 
                statusUpdatedOn     : dt
            });

            newTenant.save((err1, t) => {

                if (!err1 && t) {

                    var newSecret = new secret({
                        validFrom 	: dt, 
                        validUntil	: null, 
                        secret		: crypto.generateSecret(), 
                        tenant_id	: req.params.tenant_id, 
                        tenant      : t._id
                    });

                    newSecret.save((err2, s) => {
                        if (!err2 && s) {
                            res.json(t);
                        }
                        else {
                            console.log(err1);
                            res.status(500).send('Something went wrong');
                        }
                    })    
                }
                else {
                    console.log(err1);
                    res.status(500).send('Something went wrong');
                }
            })
        });

    // Get a specific tenant
    router.route('/tenants/:tenant_id')
        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .get(function(req, res) {

            tenant.findOne({ tenantId : req.params.tenant_id }, (err, t) => {
                if (!err && t) {
                    res.json(t);
                }
                else {
                    if (err) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No tenant could be found with the specified id');	
                    }
                }
            })
        });

    router.route('/tenants/:tenant_id/secret')
        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .get(function(req, res) {

            var secretQuery = queryHelper.getSecretQuery(req.params.tenant_id, req.query.date)

            secret.find(secretQuery, (err, s) => {
                if (!err && s) {
                    res.json(s);
                }
                else {
                    if (err) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No client secret could be found with the specified id and effective date');	
                    }
                }

            })        
        })

        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .post(function(req, res) {

            var dt = new Date();

            tenant.findOne({ tenantId : req.params.tenant_id }, (err, t) => {
                if (!err && t) {

                    var secretQuery = queryHelper.getSecretQuery(req.params.tenant_id, dt);

                    // And create a new secret
                    var newSecret = new secret({
                        validFrom 	: dt, 
                        validUntil	: null, 
                        secret		: crypto.generateSecret(), 
                        tenant_id	: req.params.tenant_id, 
                        tenant      : t._id
                    });

                    console.log(newSecret);

                    secret.findOne(secretQuery)
                        .exec(function(err1, s1) {
                            if (!err1 && s1) {

                                // Set the valid until date on the old secret
                                s1.validUntil = dt;

                                s1.save(function(err2, s2) {
                                    
                                    console.log("Previous secret has been terminated");

                                    newSecret.save(newSecret, function(err3, s3) {
                                        if (!err3 && s3) {
                                            console.log("New secret has been saved");
                                            res.json({ previous: s2, current: s3});
                                        }
                                        else {
                                            console.log(err);
                                            res.status(500).send('Something went wrong');
                                        }
                                    })
                                });
                            }
                            else {
                                console.log("No previous secret has been created");

                                newSecret.save(newSecret, function(err3, s3) {
                                    if (!err3 && s3) {
                                        console.log("New secret has been saved");
                                        res.json({current : s3});
                                    }
                                    else {
                                        console.log(err);
                                        res.status(500).send('Something went wrong');
                                    }
                                })
                            }
                        });
                }
                else {
                    if (err) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No tenant could be found with the specified id');	
                    }
                }
            })
        });

    router.route('/tenants/:tenant_id/status')

        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .get((req, res) => {

            tenant.findOne({ tenantId : req.params.tenant_id}, (err, t) => {
                
                if (!err && t) {
                    res.json({ 
                        status 				: t.status, 
                        statusDescription 	: t.statusDescription, 
                        statusUpdatedOn 	: t.statusUpdatedOn
                    });
                }
                else {
                    if (err1) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No tenant could be found with the specified id');	
                    }
                }
            });
        })

        // TODO: SECURITY:  REQUIRES ADMIN ACCESS
        .put((req ,res) => {

            tenant.findOne({ tenantId : req.params.tenant_id}, (err1, t1) => {
                if (!err1 && t1) {

                    t1.status = req.body.status;
                    t1.statusDescription = req.body.statusDescription;
                    t1.statusUpdatedOn = req.body.statusUpdatedOn;

                    t1.save((err2, t2) => {

                        if (!err2 && t2) {
                            res.json({ 
                                status 				: t2.status, 
                                statusDescription 	: t2.statusDescription, 
                                statusUpdatedOn 	: t2.statusUpdatedOn
                            });
                        }
                        else {
                            res.status(500).send('Something went wrong');		
                        }
                    });
                }
                else {
                    if (err1) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No tenant could be found with the specified id');	
                    }
                }
            })
        });

    router.route('/tenants/:tenant_id/submissions')

        // TODO: SECURITY:  REQUIRES PRIVATE TENANT ACCESS
        .get((req, res) => {

            tenant.findOne({ tenantId : req.params.tenant_id}, (err1, t) => {
                if (!err1 && t) {

                    submission.find( {'site.tenant_id' : t._id }, function(err, s) {
                        if (err) {
                            res.status(500).send('Something went wrong');
                        }
                        else {
                            res.json(s);
                        }
                    });
                }
                else {
                    if (err1) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No tenant could be found with the specified id');	
                    }
                }
            })
        })

        // TODO: SECURITY: REQUIRED PUBLIC ACCESS
        .post(function(req, res) {

            tenant.findOne({ tenantId : req.params.tenant_id })
                .exec(function(err, t) {

                    if (!err) {
                        if (t) {

                            // Obtain the secret user to encrypt the submission ids
                            var secretQuery = query.getSecret(t.id);

                            secret.findOne(secretQuery, (err, sec) => {
                                if (!err) {
                                    if (sec) {
                                        var newId = new ObjectId();

                                        var sub = new submission({
                                            _id: newId, 
                                            timestamp : new Date(), 
                                            token: crypto.encrypt({ t: t.id, s: newId }, sec.secret),
                                            site : new site({
                                                tenant_id	: t.id, 
                                                siteDomain  : req.body.site_domain, 
                                                path 		: req.body.site_path
                                            }), 
                                            person : new person({
                                                externId 	: req.body.contact_externId,
                                                firstName 	: req.body.contact_firstName,
                                                lastName 	: req.body.contact_lastName,
                                                email 		: req.body.contact_email,
                                                mobNumber 	: req.body.contact_mobNumber,
                                                postcode 	: req.body.contact_postcode		
                                            }), 
                                            answer : _.map(req.body.answers, function(a) {
                                                return new answer({
                                                    question_id : a.question_id, 
                                                    value : a.answer
                                                })
                                            })
                                        });

                                        sub.save(function(err, s) {
                                            console.log(err);

                                            if (!err) {
                                                res.json({submission_id: s.token});	
                                            }
                                            else {
                                                res.status(500).send('Something went wrong');		
                                            }
                                        });
                                    }
                                    else {
                                        res.status(404).send('No secret could be found');	
                                    }
                                }
                                else {
                                    res.status(500).send('Somethign went wrong');
                                }
                            });
                        }
                        else {
                            res.status(404).send('No tenant exists with the specified id');	
                        }
                    }
                    else {
                        res.status(500).send('Something went wrong');
                    }
            })
        });


    router.route('/tenants/:tenant_id/submissions/:id')

        // TODO: SECURITY:  REQUIRES PUBLIC ACCESS
        .get((req, res) => {

            // The id is a valid MongoDB object id, so include this in the query
            var query = {
                'site.tenant_id' : req.params.tenant_id,
                token			 : req.params.id
            }
            
            submission.findOne(query, function(err, submission) {
                if (!err && submission) {
                    res.json(submission);
                }
                else {
                    if (err) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No submission was found for the tenant and id provided.');	
                    }
                }
            });
        })

        // TODO: SECURITY:  REQUIRES PUBLIC ACCESS
        .put(function(req, res) {

            // The id is a valid MongoDB object id, so include this in the query
            var query = {
                'site.tenant_id' : req.params.tenant_id,
                token			 : req.params.id
            }
            
            submission.findOne(query, function(err, submission) {
                if (!err && submission) {
                    
                    // TODO Update the answers
                    // Save
                    // Trigger web hook?

                }
                else {
                    if (err) {
                        res.status(500).send('Something went wrong');
                    }
                    else {
                        res.status(404).send('No submission was found for the tenant and id provided.');	
                    }
                }
            });
        });

        router.route('/tenants/:tenant_id/questions')

            // TODO: SECURITY:  REQUIRES PUBLIC ACCESS
            .get(function(req, res) {

                // TODO: Currently returning generic questions, however they should be linked to a tenant
                var currentQuestionsQuery = query.getCurrentQuestions(req.params.culture, req.query.uiCulture);

                question.find(currentQuestionsQuery)
                        .exec(function(err, q) {
                            if (!err) {
                                res.json(q);	
                            }
                            else {
                                res.status(500).send('Something went wrong');
                            }
                        });
            })
}
