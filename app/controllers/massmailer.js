 
exports.sendFormMail = function(req,res) {

    // body.user: name, email, username,  body: subject, tokenURL, formEmail

    console.log('formMailer ' + formEmail); 
    
    var message = {
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        subject: req.body.subject,
        tokenURL: req.body.tokenURL,
        supportURL: req.protocol + "://" + req.get('host') + "/support",
        notMyAccountURL: req.protocol + "://" + req.get('host') + "/support/notmyaccount",
        compromisedURL: req.protocol + "://" + req.get('host') + "/support/compromised"
    };

    mailer.sendTemplate(req.body.formEmail, message, function(error, response, html, text) { 
        if (error) {
            console.log("Error in sending " + formEmail + " " + response);
            done(error);
        }        
        else {
            console.log("Success in sending " + formEmail + " " + response);
            res.json(response);         
        }
    });
};
 
