/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore');


exports.render = function(req, res) {
    console.log("Inside splash.render");
    res.render('splash', {
        user: req.user  
    });
};
