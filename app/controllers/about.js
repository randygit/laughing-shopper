/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore');


exports.about = function(req, res) {
    console.log("Inside about.about");
    res.render('about/about', {
        user: req.user  
    });
};

exports.faq = function(req, res) {
    res.render('about/faq', {
        user: req.user  
    });
};

exports.terms = function(req, res) {
    res.render('about/terms', {
        user: req.user  
    });
};
