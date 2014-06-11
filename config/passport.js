var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    User = mongoose.model('User2'),
    config = require('./config');


module.exports = function(passport) {
    //Serialize sessions
    // have to modify this for the correct user

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({
            _id: id
        }, function(err, user) {
            done(err, user);
        });
    });

    //Use local strategy
    //modify since the db could have several records
    //of the same email but the only the verified account is valid

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {

            // parameters email and password, done is callback function(err,user)

            //console.log("passport.local ");
            User.find({ 'email': email, verified: true },
                function(err,user) {

                if(err) {
                    return done(err);
                }

                //console.log('User             ' + JSON.stringify(user));
                //console.log('User.length      ' + user.length);

                if(user.length === 0) {
                    console.log("passport.local unknown user");
                    return done(null, false, {
                        message: 'Passport.local: Unknown user'
                    });
                }
                if(user.length == 1) {

                    var validUser = user[0];
                    /*
                    console.log('User.email         ' + validUser.email);
                    console.log('User.disabled      ' + validUser.disabled);
                    console.log('User.deactivated   ' + validUser.deactivated);
                    console.log('User.loginAttempts ' + validUser.loginAttempts);
                    console.log('User.lockUntil     ' + validUser.lockUntil);



                    console.log('passport.local check if disabled ' + validUser.disabled);
                    */

                    //check if disabled is true
                    if (validUser.disabled) {
                        //console.log("passport.local account is disabled");
                        return done(null, false, {
                            message: 'Passport.local: account is disabled.'
                        });
                    }
                    //console.log('passport.local check if deactivated '+ validUser.deactivated);

                    //check if deactivated is true
                    if (validUser.deactivated) {
                        //console.log("passport.local account is deactivated");
                        return done(null, false, {
                            message: 'Passport.local: account is deactivated.'
                        });
                    }

                    if(validUser.isLocked) {
                        // just increment login attempts if the account is locked
                        //console.log('passport.local user is locked');
                        return validUser.incLoginAttempts(function(err){
                            if(err) done(err);
                            //console.log("passport.local account is locked. max attempts");
                            return done(null, false, {
                                message: 'Passport.local: account is locked.'
                            });

                        });
                    }

                    //console.log('passport.local check for password');

                    // check for valid password
                    if (!validUser.authenticate(password)) {
                        //console.log('passport.local invalid password. increment counter');
                        // password is incorrect increment counter first
                        validUser.incLoginAttempts(function(err){
                            if(err) return done(err);

                        });

                        // return message of invalid password
                        //console.log("passport.local invalid password");
                        return done(null, false, {
                            message: 'Passport.local: Invalid password.'
                        });
                    }
                    else {
                        // password is ok

                        //console.log('passport.local password is ok, resetting counters');

                        // if there are no locks or failed attempts, ret the user
                        if (!validUser.loginAttempts && !validUser.lockUntil)
                            return done(null,validUser);
                        // reset attempts and lock info

                        //console.log('passport.local reset attempts and lock info');

                        var updates = {
                            $set: { loginAttempts: 0 },
                            $unset: { lockUntil: 1 }
                        };
                        //console.log('passport.local about to update user record');

                        return validUser.update(updates, function(err) {
                           //console.log('passport.local back from user.update');
                            if (err) return done(err);
                            return done(null, validUser);
                        });
                    }

                }
                if (user.length > 1) {
                    // kagulo na
                    //console.log("passport.local multiple records for the user exist!");
                    return done(null, false, {
                        message: 'Passport.local: multiple records for the user exist'
                    });

                }
            });
        }
    ));

    passport.use(new BasicStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            //console.log('Basic Strategy');
            User.find({ 'email': email, verified: true },{ email:1, verified:1}, function(err,user) {
                if (user.length == 1) {

                    console.log("user record for " + email + " found. " );


                    if(user[0].password != password) {
                        //console.log('Incorrect password');
                        return done(null, false);

                    }
                    else {
                        //console.log('Password is correct');
                        return done(null, user);

                    }
                }
                else {
                    //console.log('incorrect email ');
                    return done(null, false);
                }
            });

        }

    ));

};
