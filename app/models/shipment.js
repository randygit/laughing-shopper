/**
 * Module dependencies.
 *
 * status: Readied,Shipped, Cancelled
   send email when shipped
   create log when activity: created, edited, deleted, shipped, cancelled
**/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShipmentSchema = new Schema({
        "orderId": Schema.Types.ObjectId,
        "orderDate": {type: Date, default: Date.now},
        "orderRef":String,
        "customerEmail":String,
        "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "qtyReadied": Number,
        "qtyShipped": Number,
        "items": [{
            productId: Schema.Types.ObjectId,
            manufacturersName: String,
            genericName: String,
            packaging: String,
            qtyReadied: Number,
            qtyShipped: Number,
            unitPrice: Number
            }],
        "status": String,
        "modifiedBy":   {"info": String, "email": String, "date": Date},
        "cancelledBy":  {"info": String, "email": String, "date": Date},
        "shipmentRef":  {"email": String, "date": Date, "notes": String},
        "trackingInfo": {"company": String, "trackingNumber": String, "status": String, "estimatedDeliveryDate": Date},
        "log": [{"email": String, "activity": String, "date": Date, "comment": String}]
});

mongoose.model('Shipment3', ShipmentSchema);
