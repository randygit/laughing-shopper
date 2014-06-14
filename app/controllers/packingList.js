/**
 * Module dependencies.
  events:
    0. create shippingDock record
    1. view all shippingDock record for a particular orderID
    2. view all shippingDock records
    3. cancel shippingDock record
    4. delete an item
    5. save changes product.qty <= itemsOrdered - itemsShipped - itemsReadied
    6. ship this record, email customer

 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    Schema = mongoose.Schema,

    Order = mongoose.model('Order26');
    Shipment = mongoose.model('Shipment4');
    PackingList = mongoose.model('PackingList2');



/*
exports.shipmentLists - list all shipments, pass the status, email (could be all)
exports.add           - add a shipment
exports.shipmentList  - get a shipment record given shipmentId
exports.edit          - update shipment a record in items given shipmentId
exports.cancel        - cancel shipment, given shipmentId
exports.delete        - delete a record in items, given shipmentId
exports.ship          - ship, status from Readied to Shipped, givenShipmentId
*/

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

exports.add = function(req, res) {

    console.log('packingList' + JSON.stringify(req.body));
    // create shippingList record

    var packingList = new PackingList({
          "orderId": Schema.Types.ObjectId,
          "qtyReadied": Number,
          "items": [{
              productId: Schema.Types.ObjectId,
              manufacturersName: String,
              genericName: String,
              packaging: String,
              qtyReadied: Number,
              qtyShipped: Number
          }],
          "status": Number,       // 0 ok 9 -cancelled
          "modifiedBy":   {"info": String, "email": String, "date": Date}
    });

    packingList.orderId    = req.body.orderId;
    packingList.qtyReadied = req.body.totQtyReadied;

    var items = [];

    for (i=0; i < req.body.items.length; i++) {
        items.push({
            'productId': req.body.items[i].productId,
            'manufacturersName':req.body.items[i].manufacturersName,
            'genericName':req.body.items[i].genericName,
            'packaging':req.body.items[i].packaging,
            'qty':req.body.items[i].qty,
            'qtyReadied':  req.body.items[i].qtyReadied,
            'qtyShipped':  req.body.items[i].qtyShipped
        });
    }

    packingList.items      = items;
    packingList.status     = req.body.status;
    packingList.modifiedBy = req.body.modifiedBy;

    packingList.save(function(err) {
        if (err) {
            console.log('error in saving ' + err);
            return res.json(err);
        }
        else {
            console.log('shippingList saved');
        }
    });



    /*

    // update order

    ADD ITEMS TO CART
    db.orders.update(
        {
            _id: req.body._id
        },
        {
             $set: { modified_on: ISODate() },
             $push: {
                 products: {
                   sku: "111445GB3", quantity: 1, title: "Simsong One mobile phone", price:1000
                 }
             }
        }
    );

    */

    res.end();


};
