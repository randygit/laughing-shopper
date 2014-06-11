/**
 * Module dependencies.

var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer');
*/

var async = require('async'),
    _ = require('underscore');
    mailer = require('../../config/mailer');


exports.render = function(req, res) {
    console.log('contact.render');

    res.render('contact/contact', {
        message: req.flash('error'),
        title: 'Contact',
        user: req.user  
    });
};

exports.sendemail = function(req,res) {
    
    
    console.log("exports.sendemail");
    console.log("User: " + req.body.username);
    console.log("Email: " + req.body.email);
    console.log("Message: " + req.body.msg);

    var mailOptions = {
        from: 'Patak mailer <info@patak.com',
        to: 'randy.gonzales@gmail.com',
        subject: 'query from ' + req.body.username + ' <' + req.body.email + '>',
        text: req.body.msg
    };


    mailer.sendSimple(mailOptions, function(err, response){
      if(err) {
          done(err);
      } else {
          console.log('Returning after mailer.sendSimple');
          res.json(response);
      }
      
    }); 
};


