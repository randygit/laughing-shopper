 
exports.sendFormMail = function(name, email, username, subject, tokenURL, formEmail, callback) {

    console.log('formMailer ' + formEmail); 
    
    var message = {
        name: name,
        email: email,
        username: username,
        subject: subject,
        tokenURL: tokenURL,
        supportURL:      'http' + "://" + 'localhost:3000' + "/support",
        notMyAccountURL: 'http' + "://" + 'localhost:3000' + "/support/notmyaccount",
        compromisedURL:  'http' + "://" + 'localhost:3000' + "/support/compromised"
    };

    mailer.sendTemplate(formEmail, message, function(error, response, html, text) { 
        if (error) {
            console.log("Error in sending " + formEmail + " " + response);
            //req.flash('error', 'Unable to send verification email ' + error.message);
        }        
        else {
            console.log("Success in sending " + formEmail + " " + response);          
        }
        return callback(error, response);
    });
};
 
