/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer'),
    VerificationTokenModel = mongoose.model('VerificationToken'),

    User = mongoose.model('User2');



exports.passwordForgotRequest = function(req,res) {

    // check if email entered is in database
    User.find({ 'email': req.body.email, verified: true },{name:1, email:1, username:1}, function(err,user) {
    // User.findOne({'email': req.body.email}, function(err, user) {
        console.log('exports.passwordForgotRequest');
        console.log('user        ' + JSON.stringify(user));
        console.log('typeof user ' + typeof user);
        console.log('user length ' + user.length);


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


<ul>
  <%
      for(var i=0; i<supplies.length; i++) {%>
        <li><%= supplies[i] %></li>
      <% }

  %>
</ul>

<!-- newuser.ejs -->
<html>
<head>
    <title>Forgot Password Confirmation</title>
</head>
    <p>
        Forgot your password, <%= name %>?
    </p>
    <p>
        TropicalMeds received a request to reset the password for your account.
        <br />
        <br />
        To reset your password, click on the link below (or copy and paste the URL into your browser):
        <br />
        <br />
        <a href="<%= verifyURL %>"><%= verifyURL %></a>
        <br />
        <br />
        If you're getting a lot of password reset emails you didn't request, you can change your account settings to require personal information to start a password reset.
        <br />
        <br />
        Check out <a href="<%= supportURL %>">our support pages</a> for more information.
        <br />
        <br />
        Thank you,
        <br />
        <br />
        <a href="<%= supportURL %>">The TropicalMeds Support Team</a>
        <br />
        <br />
        If you received this message in error and did not signup for a TropicalMeds account, click <a href="<%= notMyAccountURL %>">not my account.</a>

    </p>
<body>
</body>
</html>
