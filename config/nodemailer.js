var nodemailer = require('nodemailer');

module.exports = function(nodemailer) {
  var smtpTransport = nodemailer.createTransport('SMTP', {
	  service: 'Gmail',
	  auth: {
	    user: "tropicalmeds@gmail.com",
	    pass: "Tropical@meds"
	  }
  });
};
