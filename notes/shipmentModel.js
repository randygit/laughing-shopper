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
                        "timestamp": ISODate()
                      }],
         "cancelledBy": {"info": String, "email": String, "date": Date},
         "log": [{"email": String, "date": Date, "comment": String}]
});

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
            unitPrice: Number     // not sure if it will appear in delivery letter
            }],
        "status": String,         // 'Prepared', while being inputted by user, 'Cancelled', 'Shipped' when finally shipped, send email partial,full,final
        "modifiedBy": {"info": String, "email": String, "date": Date}      // could be redundant, there is log anyway
        "cancelledBy": {"info": String, "email": String, "date": Date},
        "shipmentRef": {"email": String, "date": Date, "notes": String},
        "trackingInfo": {"company": String, "trackingNumber": String, "status": String, "estimatedDeliveryDate": Date}
        "log": [{"email": String, "activity": String, date": Date, "comment": String}]    // activity: created, edited, deleted, shipped, cancelled
});

mongoose.model('Shipment', ShipmentSchema);
mongoose.model('Order14', OrderSchema);

TODO:
1. reviewController, itemShippedCount = 0;
2. order.add, order.itemShippedCount  = req.body.itemShippedCount; or 0 making reviewController update redundant

3. view all orders where itemShippedCount is less than itemCount
   extract orderDate, customerEmail, itemCount, itemShipped, items[], shipment[]
   search by email,

   view order details.. manuName, genericName, packaging, qty, qtyShipped, qtyRemaining same as order.jade but add qtyShipped, qtyUnshipped
   view shipment Records, show status: Prepared, Cancelled,Shipped

   edit Prepared Shipment
              update Shipment push[items]
              update Order.itemShippedCount, push[ shipment]
   create new Shipment
              create shipment Record, push[items]
              update Order.itemShippedCount, push[ shipment]

4. view shipment records, Prepared, Cancelled, Shipped
   extract orderDate, customerEmail, Status, date last modified.
   action: Cancel, ship

CUSTOMER VIEW
1. view orders where itemShippedCount < itemCount  pending
2. view orders shipped fully historical

CUSTOMER SUPPORT
1. view all orders for given email, show full, partial shipment
   view shipment information

   save into log file of user..

SHIPMENT DESIGN
1. View Order Shipment Status List for all customers. Search by customer Name, email, order Date

Order Date, Customer Name, ItemCount, QtyReadied,QtyShipped, Qty to be Processed View Qty Details List  View Order Details
----------  -------------  ---------  ---------- ----------  ------------------- --------------------- ------------------

 (ItemCount - QtyReadied - QtyShipped)
options:
         View Order Details
         View Qty Order Items Qty Details List

2. View Order Qty Details List

Order Date:
Ship To:
Address1
Address2
Address3
City
State
Country
Zipcode

# Product Name, Generic Name, Packaging, QtyOrdered, QtyReadied, QtyShipped, QtyToBeProcessed, View Shipment List

option: view Shipment List


3. View Shipment List for an order

Order Date:
Ship To:
Address1
Address2
Address3
City
State
Country
Zipcode

#, shipment Date, customerName, customerEmail, QtyReadied, QtyShipped, Status, View Shipment

options: Create shipment Record
         View shipment Record

4. view existing shipment Record

Order Date:                      Shipment Status: Shipped             Status: Cancelled            Status: Readied
Ship To:                         ShipmentRef.email                    shipment.cancelledBy.email   modifiedBy.email
Address1                         ShipmentRef.date                     shipment.cancelledBy.info    modifiedBy.date
Address2                         ShipmentRef.notes                    shipment.cancelledBy.notes
Address3                         TrackingInfo.company
City                             TrackingInfo.trackingNumber
State                            TrackingInfo.status
Country                          TrackingInfo.estimatedDeliveryDate
Zipcode

#, Product Name, GenericName, Packaging, unitPrice, QtyReadied, QtyShipped, Delete Record
                                                    input field

Log:
   date, email, activity, comment

options: Cancel shipment (readied only)
         Save changes in QtyReadied
         Ship Final
         Delete Line
         Print Delivery Receipt

5. Create Shipment Record

Order Date:
Ship To:
Address1
Address2
Address3
City
State
Country
Zipcode

#, Product Name, GenericName, Packaging, unitPrice, QtyReadied, QtyShipped, Delete Record
                                                    input field

options: Cancel shipment (readied only)
         Save changes in QtyReadied
         Shipment
         Delete Record
LISTS:
1. View Order Shipment status for all customers
2. View Order Qty Details List
3. View Shipment Record List for an order

ACTIONS
1. View Order Record, same as wu/order.js
2. Create shipment Record, save new Record
3. View existing shipment Record (allow editing of qtyReadied)
4. Delete product from shipment List (modal)
5. Cancel shipment record (for status = Readied only)
6. Save changes in shipment Record
7. ship Finally
8. print Delivery Receipt, download?
