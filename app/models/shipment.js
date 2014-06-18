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
        "deliveryRef": String,             // company DR number
        "shipmentDate": Date,
        "orderId": Schema.Types.ObjectId,
        "readiedId": Schema.Types.ObjectId,
        "orderDate": Date,
        "orderRef":String,
        "customerName": String,
        "customerEmail":String,
        "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "qtyShipped": Number,
        "items": [{
            productId: Schema.Types.ObjectId,
            manufacturersName: String,
            genericName: String,
            packaging: String,
            qtyShipped: Number
            }],
        "status": String,         // 0 ok 9 cancelled
        "cancelledBy":  {"info": String, "email": String, "date": Date},
        "shipmentRef":  {"email": String, "date": Date, "details": String, "when":String, "by":String},
        "trackingInfo": {"company": String, "trackingNumber": String, "status": String, "estimatedDeliveryDate": Date}
});

mongoose.model('Shipment9', ShipmentSchema);
