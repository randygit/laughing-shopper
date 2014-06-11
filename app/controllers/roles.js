/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),

    User = mongoose.model('User2');

/**
 * Auth callback. what is this here
 */

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

exports.users = function(req,res) {
    console.log('role.find()');
    User.find({verified:true},{name:1, email:1, role:1, deactivated:1}, function(err,Users) {
        if(!err) {
            res.json(Users);
        }
        else {
            console.log('Error in roles');
            res.redirect('/');
        }

    });
};

exports.user = function(req,res) {
    console.log('User.find()' + req.params.id);
    var id = req.params.id;
    if(id) {
        User.findById(id, function(err,User) {
            if(!err) {
                if(User) {
                    res.json({User: User, status: true});
                }
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in Users');
                res.json({status:false});
            }

        });

    }
};



exports.edit = function (req, res) {
    //console.log('User.edit() ' + JSON.stringify(req.body));
    console.log('User id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        User.findById(id, function (err, User) {
            if(!err) {
                if(User) {
                    //console.log('User.edit() ' + JSON.stringify(User));
                    console.log('findById ' + User.name);

                    User.role = req.body.role;
                    User.deactivated = req.body.deactivated;

                    User.save(function (err) {
                        if (!err) {
                            res.json(true);
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });

                }   // if User
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in Users');
                res.json({status:false});
            }
        });
    }
};
