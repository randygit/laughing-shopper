/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var CountrySchema = new Schema({
        "countries": [ {name: String, code: String}]       
});
    

module.exports = mongoose.model('Nations', CountrySchema); 
