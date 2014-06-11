/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var ProductSchema = new Schema({
    sku: String,
    description: {
      manufacturersName: String,
      genericName: String,
      packaging: String
    },
    sellFlag: {type: Boolean, default: true},
    manufacture_details: {
      model_number: String,
      release_date: Date,
    },
    quantity: Number,
    pricing: {
      unitPrice: Number,
      list: Number,
      retail: Number,
      savings: Number,
      pct_savings: Number
    },
    shipping: {
      weight: Number,
      dimensions: {
        width: Number,
        height: Number,
        depth: Number
      },
    },
    categories: [],
    in_carts:[]
});

mongoose.model('NewProduct', ProductSchema);
