/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

   

var PositionSchema = new Schema({
        "position": { role: Number, name: String}      
});
    
mongoose.model('Positions', PositionSchema);
