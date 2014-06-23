/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer'),
    VerificationTokenModel = mongoose.model('VerificationToken'),

    User = mongoose.model('User2');

/**
 * Auth callback. what is this here
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};



exports.reset = function(req, res) {
    res.render('users/reset', {
        message: req.flash('error'),
        title: 'Reset',
        user: req.user
    });
};

// FORGOT PASSWORD PROCESS

exports.forgot = function(req, res) {
    res.render('users/forgot', {
        // initially used info but did not work, used 'error' instead
        // 'info' is set by exports.create
        message: req.flash('error'),
        title: 'Forgot password',
        user: req.user
    });
};


exports.passwordForgotRequest = function(req,res) {

    // check if email entered is in database
    User.find({ 'email': req.body.email, verified: true },{name:1, email:1, username:1}, function(err,user) {
    // User.findOne({'email': req.body.email}, function(err, user) {
        //console.log('exports.passwordForgotRequest');
        //console.log('user        ' + JSON.stringify(user));
        //console.log('typeof user ' + typeof user);
        //console.log('user length ' + user.length);


        if(user.length === 0) {


            req.flash('error', 'Email is not used');
            return res.redirect('/forgot');

        }

        if(user.length == 1){

            var verificationToken = new VerificationTokenModel(
                    {_userId:user[0]._id, purpose: 'forgot password'});

                verificationToken.createVerificationToken(function(err,token) {
                    if (err) {
                        req.flash('error', 'Error in creating verification token');
                        return res.redirect('/users/forgot');
                    }
                    if (token) {
                        console.log('Verification token created');
                        var message = {
                            name: user[0].name,
                            email: user[0].email,
                            username: user[0].username,
                            subject: 'Reset your Patak password',
                            verifyURL: req.protocol + "://" + req.get('host') + "/verify/forgotpassword/confirm/" + token,
                            supportURL: req.protocol + "://" + req.get('host') + "/support/",
                            notMyAccountURL: req.protocol + "://" + req.get('host') + "/support/notmyaccount"
                        };

                        mailer.sendTemplate('forgotpassword', message, function(error, response, html, text) {
                            if (error) {
                               req.flash('error', 'Unable to send verification email ' + error.message);
                               return res.redirect('/signup');
                            }
                            else {
                              console.log("Verification email sent for delivery");
                              //console.log('Reponse ' + response);
                              //console.log('HTML ' + html);
                              //console.log('TEXT ' + text);
                            }
                        });

                    }
              });



              //user will not be allowed to check in until verification process is completed
              //
              req.flash('error', 'Please check your email for instructions on how to change your password.');
              return res.redirect('forgot');

        } // end else


    });

};


// SIGNUP PROCESS exports.signup and exports.create

exports.signup = function(req, res) {
    res.render('users/signup', {
        // initially used info but did not work, used 'error' instead
        // 'info' is set by exports.create
        message: req.flash('error'),
        title: 'Signup',
        user: req.user
    });
};


// after input at /app/views/signup.jade
// verify that
// 1. no records of the email that has been verified
// 2. no records of the username that has been verified

// if OK
// 1. create user record
// 2. create token
// 3. send email


exports.create = function(req, res) {

    // find a verified user with this email
    console.log("app.create email    " + req.body.email );

    // user.find returns an array
    User.find({ 'email': req.body.email, verified: true },{email:1, verified:1}, function(err,user) {
        if(err) done(err);

        console.log('user        ' + JSON.stringify(user));
        console.log('typeof user ' + typeof user);
        console.log('user length ' + user.length);

      if(user.length > 0) {

          console.log("Email " + req.body.email + " exists in the database. isEmailTaken" );
          req.flash('error', 'The email ' + req.body.email + ' is already used.');
          return res.redirect('/signup');
      }

      if(user.length ===0 ) {
          // create new user

          var newUser = new User(req.body);
          newUser.provider = 'local';
          newUser.createdAt = Date.now();
          newUser.save(function(err) {
              if(err) {
                  console.log('error in user.create ' + err);
                  // render an html
                  return res.render('/signup', {
                    errors: err.errors,
                    user: user
                  });
              }
              else {
                    console.log("no problem in user.create ");

                    var verificationToken = new VerificationTokenModel(
                        {_userId: newUser._id, purpose: 'new account'});

                    verificationToken.createVerificationToken(function(err,token) {
                        if (err) {
                            req.flash('error', 'Error in creating verification token');
                            return res.redirect('/signup');
                        }
                        if (token) {
                            console.log('Verification token created');
                            var message = {
                                name: newUser.name,
                                email: newUser.email,
                                username: newUser.username,
                                subject: 'Confirm your account on TropicalMeds.com',
                                verifyURL: req.protocol + "://" + req.get('host') + "/verify/user/confirm/" + token,
                                supportURL: req.protocol + "://" + req.get('host') + "/support"
                            };

                            mailer.sendTemplate('newuser', message, function(error, response, html, text) {
                                if (error) {
                                   req.flash('error', 'Unable to send verification email ' + error.message);
                                   return res.redirect('/signup');
                                }
                                else {
                                  console.log("Verification email sent for delivery");
                                }
                            });


                        }
                    });



                    //user will not be allowed to check in until verification process is completed
                    //
                    req.flash('error', 'Your account has been created but needs to be verified. Please check your email for instructions.');
                    return res.redirect('/signup');

              }   //endif
          });   //newuser.save

        }          //User.email.length === 0
    });          //User.email
};

// /app/view/profile/profile.jade as called by main menu
// called by controller. you have to return else it will wait forever
// /public/js/controllers/profileFormController
//  $scope.updateProfile
// app.post('/user/profile', users.updateProfile);

exports.getProfile = function(req,res) {

    // if part of the URL, use req.params.email
    //console.log('Inside getProfile req.params.email    :' + req.params.email);

    var profile = {};

    User.find({ 'email': req.params.email, verified: true }, function(err,user) {
        if (err) return done(err);

        if (user.length == 1) {

            validUser = user[0];


            var profile = {
                fullname: validUser.name,
                address1: validUser.address1,
                address2: validUser.address2,
                address3: validUser.address3,
                city: validUser.city,
                state: validUser.state,
                zipcode: validUser.zipcode,
                country: validUser.country
            };


            //console.log('profile ' + JSON.stringify(profile));

            res.json(profile);

        } // end if (user)

    }); // end User.findOne

};

exports.updateProfile = function(req,res) {

    // if part of the URL, use req.params.email
    //console.log('Inside updateProfile req.params.email    :' + req.params.email);


    // console.log('req.body: ' + JSON.stringify(req.body));
    //console.log('req.files ' + JSON.stringify(req.files.uploadme));

    User.find({ 'email': req.params.email, verified: true }, function(err,user) {
        if (err) return done(err);

        if (user.length == 1) {

            validUser = user[0];

            console.log('User name from mongo:' + validUser.name);

            validUser.name      = req.body.fullname;
            validUser.address1   = req.body.address1;
            validUser.address2   = req.body.address2;
            validUser.address3   = req.body.address3;
            validUser.city       = req.body.city;
            validUser.state      = req.body.state;
            validUser.country   = req.body.country;
            validUser.zipcode   = req.body.zipcode;

            validUser.save(function(err){
                if (err) done(err);
                else {
                    // use this to return to controller
                    res.json(200);
                }
            }); // user.save


        } // end if (user)

    }); // end User.findOne

};




exports.updatePassword = function(req,res) {

    // if part of the URL, use req.params.email
    //console.log('Inside updatePassword email    :' + req.params.email + ' current <' +
    //             req.body.currentpassword + '> new <' + req.body.newpassword + '>');


    User.find({ 'email': req.params.email, verified: true }, function(err,user) {
        if (err) return done(err);

        if (user.length == 1) {

            validUser = user[0];
            //console.log('Valid User ' + validUser.email);
            var flag = validUser.authenticate(req.body.currentpassword);
            if (flag) {
                //console.log('Current password is correct');
                validUser.password = req.body.newpassword;
                validUser.save(function(err){
                    if (err) done(err);
                    else {
                        //console.log('New password saved!');
                        req.flash('error', 'New password saved!');
                        res.send(200);
                        //return res.redirect('/resetpassword');
                    }
                }); // user.save

                res.send(200);
            }
            else {
                //console.log('Wrong current password');
                req.flash('error', 'The current password is not correct.');
                //return res.redirect('/resetpassword');
                res.send(401);
            }
        }
        else {
            //console.log('Wrong email');
            req.flash('error', 'The email ' + req.body.email + ' is wrong.');
            //return res.redirect('/resetpassword');
            res.send(401);
        }

    }); // end User.findOne

};

exports.validatePassword = function(req,res) {

    // if part of the URL, use req.params.email
    //console.log('Inside validatePassword email    :' + req.params.email + ' password <' + req.body.password + '>');


    User.find({ 'email': req.params.email, verified: true }, function(err,user) {
        if (err) return done(err);

        if (user.length == 1) {

            validUser = user[0];
            //console.log('Valid User ' + validUser.email);
            var flag = validUser.authenticate(req.body.password);
            if (flag) {
                //console.log('Current password is correct');

                res.send(200);
            }
            else {
                //console.log('Wrong current password');
                //req.flash('error', 'The current password is not correct.');
                //return res.redirect('/resetpassword');
                res.send(401);
            }
        }
        else {
            //console.log('Wrong email');
            //req.flash('error', 'The email ' + req.body.email + ' is wrong.');
            //return res.redirect('/resetpassword');
            res.send(401);
        }

    }); // end User.findOne

};


// LOGIN PROCESS: exports.login, exports.session and exports.welcome

exports.login = function(req, res) {
    res.render('users/login', {
        // 'error' is used by failureFlash
        message: req.flash('error'),
        title: 'Login',
        user: req.user
    });
};

exports.session = function(req, res) {
    res.redirect('/');
};


exports.validateUsername = function(req,res) {
    // if part of the URL, use req.params.email
    //console.log('Inside validateUserName req.params.email: ' + req.params.email);
    //console.log("verify username " + req.body.username );

    var username = req.body.username;
    var email = req.params.email;

    User.find({ 'username': username, verified: true },{username:1, email:1, verified:1}, function(err,user) {
        if (user.length == 1) {
            //console.log("User[0] " + user[0].username + " email " + user[0].email);
            if (user[0].email == email) {
                //console.log("User name no change " + user[0].username);
                res.send(200);

            }
            else {
                //console.log("User name is already used " + user[0].username);
                res.send(401);

            }
        }
        else {
            //console.log("Username is available ");
            res.send(200);
        }

    });
};

exports.verifyEmail = function(req,res) {
    //console.log("verifyEmail <" + req.body.email + ">" );

    User.find({ 'email': req.body.email, verified: true },{username:1, email:1, verified:1}, function(err,user) {
        if (user.length == 1) {
            //console.log("Email in file " + user[0].username + " email " + user[0].email);
            res.send(200);
        }
        else {
            //console.log("Email is not in database ");
            res.send(401);
        }

    });
};

exports.verifyUsername = function(req,res) {
    //console.log("verifyUsername <" + req.body.username + ">"  );

    User.find({ 'username': req.body.username, verified: true },{username:1, email:1, verified:1}, function(err,user) {
        if (user.length == 1) {
            //console.log("Username in file " + user[0].username + " email " + user[0].email);
            res.send(200);
        }
        else {
            //console.log("Username is not in database ");
            res.send(401);
        }

    });
};

exports.resetpassword = function(req, res) {
    res.render('profile/resetpassword', {
        message: req.flash('error'),
        title: 'Reset',
        user: req.user
    });
};

exports.list = function(req,res) {
    console.log('user.list()');
    User.find({verified:true, role:9},{name:1, email:1, deactivated:1, disabled:1}, {sort: {name: 1}}, function(err,Users) {
        if(!err) {
            res.json(Users);
        }
        else {
            console.log('Error in users');
            res.redirect('/');
        }

    });
};

exports.welcome = function(req, res) {
    res.render('welcome', {
        title: 'Welcome',
        user: req.user
    });
};


/** Logout  */
exports.signout = function(req, res) {
    console.log('Logging out');
    req.logout();
    res.redirect('/');
};
