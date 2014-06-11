/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'), 

    Contact = mongoose.model('Contact'); 

/**
 * Auth callback. what is this here
 */

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

exports.contacts = function(req,res) {
    console.log('contact.find()');
    Contact.find({},{}, function(err,contacts) {
        if(!err) {
            res.json(contacts);
        }
        else {
            console.log('Error in contacts');
            res.redirect('/');
        }
    
    });
};

exports.contact = function(req,res) {
    console.log('contact.find()' + req.params.id);
    var id = req.params.id;
    if(id) {
        Contact.findById(id, function(err,contact) {
            if(!err) {
                if(contact) {
                    res.json({contact: contact, status: true});
                }
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in contacts');
                res.json({status:false});
            }
        
        });
    
    }
};

exports.add = function(req,res) { 

    console.log('contact.add()' + JSON.stringify(req.body)); 

    contact = new Contact({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        skype: req.body.skype    
    });

    contact.save(function(err) {
        if(!err) {
            console.log('saved to file');
            res.json(req.body); 
        }
        else {
            res.json(err);
        }
    });

    console.log('what are you doing here');
    res.json(req.body);

}; 

exports.edit = function (req, res) {
    console.log('contact.edit() ' + JSON.stringify(req.body)); 
    console.log('contact id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        Contact.findById(id, function (err, contact) {
            if(!err) {
                if(contact) {
                    console.log('contact.edit() ' + JSON.stringify(contact)); 
                    console.log('findById ' + contact.name); 

                    contact.name = req.body.name;
                    contact.phone = req.body.phone;
                    contact.email = req.body.email;
                    contact.facebook = req.body.facebook;
                    contact.twitter = req.body.twitter;
                    contact.skype = req.body.skype;

                    contact.save(function (err) {
                        if (!err) {
                            res.json(true);
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });
                
                }   // if contact
                else {
                    res.json({status:false}); 
                }
            }
            else {
                console.log('Error in contacts');
                res.json({status:false});
            }
        });
    }
};

exports.delete = function (req, res) {
     
    console.log('contact delete id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        Contact.findById(id, function (err, contact) {
            contact.remove(function (err) {
              if (!err) {
                console.log("removed");
                res.json(true);
              } else {
                res.json(false);
                console.log(err);
              }
            });
        });
    }
};

