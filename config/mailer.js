// called by app/controller/contacts.js
// called by app/controller/verificationtoken

//'use strict';

var config          = require('./config'),
    nodemailer      = require('nodemailer'),
    path            = require('path'),
    templatesDir    = path.resolve(__dirname, '..', 'app/email-templates'),
    emailTemplates  = require('email-templates');

var EmailAddressRequiredError = new Error('email address required');

//create a default transport using what is defined ./config/all.js
var defaultTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: config.mailer.auth.user,
        pass: config.mailer.auth.pass
    }
});

exports.sendSimple = function(mailOptions, fn) {
    // make sure that we have an user email
    if (!mailOptions.to) {
        return fn(EmailAddressRequiredError);
    }

    if(!mailOptions.subject) {
        return fn(EmailAddressRequiredError);
    }

    var transport = defaultTransport;
    transport.sendMail(mailOptions, function(error, response){
        if (error) {
            return fn(error);

        } else {
            return fn(null, response.message);
        }
    });
};

exports.sendTemplate = function(templateName, locals, fn) {

    // make sure that we have an user email
    if (!locals.email) {
        return fn(EmailAddressRequiredError);
    }

    if(!locals.subject) {
        return fn(EmailAddressRequiredError);
    }

    emailTemplates(templatesDir, function(err, template) {
        if(err) {
            return fn(err);
        }
        // send a single email
        if(!template) {
            return fn(err);
        }

        template(templateName, locals, function(err, html, text) {
            if (err) {
                return fn(err);
            }

            var transport = defaultTransport;

            // loop here, try 3x
            transport.sendMail({
                from: config.mailer.defaultFormAddress,
                to: locals.email,
                subject: locals.subject,
                html: html,
                generateTextFromHTML: true,
                text: text
            }, function(err, responseStatus) {
                if (err) {
                    // save email variables and email later? how?
                    return fn(err);
                }
                else {
                    console.log(responseStatus.message);
                }
                return fn(null, responseStatus.message, html, text);
            });
        });

    });

};
