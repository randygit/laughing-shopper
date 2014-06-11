/**
 * Module dependencies.
 */

// no need to update footer. this controller is specified by /config/route.js

var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer'), 
    VerificationTokenModel = mongoose.model('VerificationToken8'),

    User = mongoose.model('User10'); 

/**
 * Auth callback. what is this here
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};


exports.picture = function(req, res) {
    res.render('testing/picture', {
        message: req.flash('error'),
        title: 'Reset',
        user: req.user  
    });
};

// user: req.user is needed for Global in controller to take effect 
exports.editform = function(req, res) {
    res.render('testing/editForm', {
        message: req.flash('error'),
        title: 'Reset',
        email: '',
        username: '',
        user: req.user  
    });
};

exports.updateform = function(req,res) {  
    // if part of the URL, use req.params.email    
    console.log('Inside updateForm req.body.email: ' + req.body.email + ' username  ' + req.body.username);  
    
    // validate email

    var emailFlag = true;
    var usernameFlag = true;

    User.find({ 'email': req.body.email, verified: true },{username:1, email:1, verified:1}, function(err,user) {
        if (user.length == 1) {
            console.log("User[0] " + user[0].username + " email " + user[0].email);  
            console.log('email is correct'); 

            // validate username

            User.find({ 'username': req.body.username, verified: true },{username:1, email:1, verified:1}, function(err,user) {
                if (user.length == 1) {
                    console.log("User[0] " + user[0].username + " email " + user[0].email);  
                    console.log('username is correct');  
                    return res.redirect('/profile'); 
                }    
                else {
                    console.log("username is not correct ");  
                    req.flash('error', 'Username is not correct');
                    res.render('/public/views/testing/editform', {
                        message: req.flash('error'),
                        title: 'Change password',
                        email: req.body.email,
                        username: req.body.username,
                        user: req.user 
                    });
                }

            });
 

        }    
        else {
            console.log("email is not correct "); 
            req.flash('error', 'Email is not correct');
            res.render('/public/views/testing/editform', {
                message: req.flash('error'),
                title: 'Change password',
                email: req.body.email,
                username: req.body.username,
                user: req.user 
            });
        }

    });

};

exports.readtestdata = function(req,res) {

    // if part of the URL, use req.params.email    
    console.log('Inside readtestdata req.params.email    :' + req.params.email); 
 
    var profile = {};
 
    User.find({ 'email': req.params.email, verified: true }, function(err,user) {
        if (err) return done(err);

        if (user.length == 1) {

            validUser = user[0];

          
            var testdata = {
                email: validUser.email,
                username: validUser.username 
            };
 
            console.log('res.json ' + JSON.stringify(testdata));
            res.json(testdata);
        
        }  
    
    });  
    
};  



