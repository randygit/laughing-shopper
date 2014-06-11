/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var OrderSchema = new Schema({
        "orderDate": {type: Date, default: Date.now},
        "orderRef":String,
        "customerEmail":String,
        "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "paymentMode": String,
        "itemCount": Number,
        "qtyReadied": Number,
        "qtyShipped": Number,
        "totalAmount": Number,
        "shippingCharges": Number,
        "grandTotal": Number,
        "ccdetails": {"cardtype": String, "cardnum": String, "expirymonth": String,
                      "expiryyear": String, "cardcvv": String},
        "ccowner" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "items": [{
                  productId: Schema.Types.ObjectId,
                  manufacturersName: String,
                  genericName: String,
                  packaging: String,
                  unitPrice: Number,
                  qty: Number,
                  subTotal: Number
                  }],
         "status":Number,
         "paymentRef":  {"info": String, "email": String, "date": Date},
         "verifiedBy":  {"info": String, "email": String, "date": Date, "amount": Number},
         "shipment": [{
                        "shipmentId": Schema.Types.ObjectId,
                        "productId": Schema.Types.ObjectId,
                        "qtyReadied": Number,
                        "qtyShipped": Number,
                        "timestamp": Date
                      }],
         "cancelledBy": {"info": String, "email": String, "date": Date},
         "log": [{"email": String, "date": Date, "comment": String}]
});

mongoose.model('Order15', OrderSchema);
