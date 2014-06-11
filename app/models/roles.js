/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

   

var RoleSchema = new Schema({
        "roles": { code: Number, role: String}      
});
    
mongoose.model('Roles', RoleSchema);
