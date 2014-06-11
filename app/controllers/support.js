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


exports.general = function(req, res) {
    console.log('support.general');

    res.render('support/general', {
        message: req.flash('error'),
        title: 'Support',
        user: req.user  
    });
};

exports.notmyaccount = function(req, res) {
    console.log('support.notmyaccount');

    res.render('support/notmyaccount', {
        message: req.flash('error'),
        title: 'Not My Account',
        user: req.user  
    });
};

exports.compromised = function(req, res) {
    console.log('support.compromised');

    res.render('support/compromised', {
        message: req.flash('error'),
        title: 'Compromised',
        user: req.user  
    });
};




