/**
 * Module dependencies.
 *
 * status: Readied,Shipped, Cancelled
   send email when shipped
   create log when activity: created, edited, deleted, shipped, cancelled

   must have trackingInfo else still in shippingDock

**/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShipmentSchema = new Schema({
        "drNumber": String,             // company DR number
        "orderId": Schema.Types.ObjectId,
        "orderDate": {type: Date},
        "orderRef":String,
        "customerName": String,
        "customerEmail":String,
        "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "qtyShipped": Number,         // no need
        "items": [{
            productId: Schema.Types.ObjectId,
            manufacturersName: String,
            genericName: String,
            packaging: String,
            qtyReadied: Number,
            qtyShipped: Number,
            unitPrice: Number
            }],
        "status": String,         // 0 ok 9 cancelled
        "cancelledBy":  {"info": String, "email": String, "date": Date},
        "shipmentRef":  {"email": String, "date": Date, "notes": String},
        "trackingInfo": {"company": String, "trackingNumber": String, "status": String, "estimatedDeliveryDate": Date},
        "log": [{"email": String, "activity": String, "date": Date, "comment": String}]  //should be in order
});

mongoose.model('Shipment4', ShipmentSchema);
