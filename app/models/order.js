/**
 * Module dependencies.
  STATUS
  0 - awaiting payment
  1 - mtcn entered, needs verification
  2 -
  3 - payment made/verified, ready for shipment,
  4 - partial shipment done ? could be 3          // not necessary
  5 - final shipment done                         // not necessary
  9 - cancelled
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;



var OrderSchema = new Schema({
        "orderDate": {type: Date, default: Date.now},
        "orderRef":String,
        "customerName":String,
        "customerEmail":String,
        "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "paymentMode": String,
        "itemCount": Number,
        "qtyReadied": Number,
        "qtyShipped": Number,
        "qtyRemaining": Number,
        "totalAmount": Number,
        "shippingCharges": Number,
        "grandTotal": Number,
        "ccdetails": {"cardtype": String, "cardnum": String, "expirymonth": String,
                      "expiryyear": String, "cardcvv": String},
        "ccowner" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "items": [{
                  "productId": Schema.Types.ObjectId,
                  "manufacturersName": String,
                  "genericName": String,
                  "packaging": String,
                  "unitPrice": Number,
                  "qty": Number,
                  "qtyReadied": Number,
                  "qtyShipped": Number,
                  "qtyRemaining": Number,
                  "subTotal": Number
                  }],
         "status":Number,
         "paymentRef":  {"info": String, "email": String, "date": Date},
         "verifiedBy":  {"info": String, "email": String, "date": Date, "amount": Number},
         "shippingMode": String,
         "readied": [{
                        "readiedId": Schema.Types.ObjectId,
                        "productId":  Schema.Types.ObjectId,
                        "manufacturersName": String,
                        "genericName": String,
                        "packaging": String,
                        "qtyReadied": Number,
                        "shippingClerk": String,
                        "timestamp": Date
                      }],
         "shipped": [{
                        "shipmentId": Schema.Types.ObjectId,
                        "productId":  Schema.Types.ObjectId,
                        "manufacturersName": String,
                        "genericName": String,
                        "packaging": String,
                        "qtyShipped": Number,
                        "shippingClerk": String,
                        "timestamp": Date
                      }],
         "cancelledBy": {"info": String, "email": String, "date": Date},
         "log": [{"email": String, "date": Date, "comment": String}]
});

mongoose.model('Order26', OrderSchema);
