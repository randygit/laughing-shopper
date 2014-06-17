/**
 * Module dependencies.
 *
 * status: Readied, Cancelled
   send email when shipped
   create log when activity: created, edited, deleted, shipped, cancelled
**/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PackingListSchema = new Schema({
        "orderId": Schema.Types.ObjectId,
        "qtyReadied": Number,
        "items": [{
            productId: Schema.Types.ObjectId,
            manufacturersName: String,
            genericName: String,
            packaging: String,
            qtyReadied: Number
        }],
        "status": Number,       // 0 ok, 1- shipped 9 -cancelled
        "modifiedBy":   {"info": String, "email": String, "date": Date},
        "cancelledBy":  {"info": String, "email": String, "date": Date},
        "log": [{"email": String, "activity": String, "date": Date, "comment": String}]  //should be in order
});

mongoose.model('PackingList3', PackingListSchema);
