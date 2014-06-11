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



exports.account = function(req, res) {
    console.log('account');

    res.render('profile/account', {
        message: req.flash('error'),
        title: 'Account',
        user: req.user  
    });
};


