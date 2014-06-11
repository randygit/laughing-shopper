/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    Countries = mongoose.model('Nations'),
    Positions = mongoose.model('Positions');

/**
 * Auth callback. what is this here
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};



exports.getCountries = function(req,res) {

    // if part of the URL, use req.params.email    
    console.log('Inside getCountries'); 
    Countries.find({},{_id:0,countries:1},function(err, objs){
        if(err) 
            done(err);
        else {
            //console.log("JSON.stringify.Countries: <" + JSON.stringify(objs[0].countries ) +">"); 
            res.json(objs[0].countries);
        }
    });
    
};

exports.getRoles = function(req,res) {

    // if part of the URL, use req.params.email    
    console.log('Inside Roles'); 
    Positions.find({},{_id:0, role:1, name:1},function(err, objs){
        if(err) 
            done(err);
        else {
            console.log("JSON.stringify.Roles: <" + JSON.stringify(objs) +">"); 
            res.json(objs);
        }
    });
    
};


