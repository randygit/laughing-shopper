/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var CartSchema = new Schema({
      email:String,
      status:String,
      quantity: Number,
      total: Number,
      products: []
});

mongoose.model('NewCart', CartSchema);
