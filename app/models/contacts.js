/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactSchema= new Schema({  
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    skype: { type: String }
}); 

mongoose.model('Contact', ContactSchema); 

 
