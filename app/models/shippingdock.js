/**
 * Module dependencies.
 *
 * status: Readied,Shipped, Cancelled
   send email when shipped
   create log when activity: created, edited, deleted, shipped, cancelled
**/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShippingDockSchema = new Schema({
        "orderId": Schema.Types.ObjectId,
        "qtyReadied": Number,
        "items": [{
            productId: Schema.Types.ObjectId,
            manufacturersName: String,
            genericName: String,
            packaging: String,
            qtyReadied: Number,
            qtyShipped: Number,
            unitPrice: Number
            }],
        "status": Number,       // cancelled
        "modifiedBy":   {"info": String, "email": String, "date": Date},
        "cancelledBy":  {"info": String, "email": String, "date": Date},
        "log": [{"email": String, "activity": String, "date": Date, "comment": String}]  //should be in order
});

mongoose.model('ShippingDock2', ShippingDockSchema);
