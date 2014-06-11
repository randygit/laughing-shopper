/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var CartSchema = new Schema({
      email:String,
      productId: Schema.Types.ObjectId,
      manufacturersName: String,
      genericName: String,
      packaging: String,
      unitPrice: Number,
      qty: Number,
      subTotal: Number
});

mongoose.model('Cart2', CartSchema);
