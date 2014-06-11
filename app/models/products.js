/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

   

var ProductSchema = new Schema({
    manufacturersName: String,
    genericName: String,
    packaging: String,
    unitPrice: Number,
    qtyOnHand: Number,
    sellFlag: Boolean              
});
    
mongoose.model('Product2s', ProductSchema);
