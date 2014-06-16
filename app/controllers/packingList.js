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



    var packingList = new PackingList({
          "orderId": {type:Schema.Types.ObjectId},
          "qtyReadied":{type:Number},
          "items": [{
              productId:{type:Schema.Types.ObjectId},
              manufacturersName: String,
              genericName: String,
              packaging: String,
              qtyReadied: {type:Number},
              qtyShipped: {type:Number}
          }],
          "status": {type:Number},       // 0 ok 9 -cancelled
          "modifiedBy":   {"info": String, "email": String, "date":{Type:Date}}
    });


    packingList.orderId    = req.body.orderId;
    packingList.qtyReadied = req.body.qtyReadied;
    packingList.status     = req.body.status;
    packingList.modifiedBy = req.body.modifiedBy;


    var items = [];

    for (i=0; i < req.body.items.length; i++) {
        items.push({
            'productId':   req.body.items[i].productId,
            'manufacturersName':req.body.items[i].manufacturersName,
            'genericName': req.body.items[i].genericName,
            'packaging':   req.body.items[i].packaging,
            'qty':         req.body.items[i].qty,
            'qtyReadied':  req.body.items[i].qtyReadied,
            'qtyShipped':  req.body.items[i].qtyShipped
        });
    }

    packingList.items      = items;

    //console.log('packing list items ' + JSON.stringify(packingList.items));
    console.log('PACKLSTID ' + packingList._id);


    packingList.save(function(err) {
        if (err) {
            console.log('error in saving ' + err);
            return res.json(err);
        }
        else {

            console.log('Preparing readiedItems');

            var readiedItems = [];

            for (i=0; i < req.body.items.length; i++) {
                if (req.body.items[i].qtyReadied > 0) {
                    readiedItems.push({
                        'readiedId':     packingList._id,
                        'productId':     req.body.items[i].productId,
                        'manufacturersName':req.body.items[i].manufacturersName,
                        'genericName':   req.body.items[i].genericName,
                        'packaging':     req.body.items[i].packaging,
                        'qty':           req.body.items[i].qty,
                        'qtyReadied':    req.body.items[i].qtyReadied,
                        'qtyShipped':    req.body.items[i].qtyShipped,
                        'shippingClerk': req.body.modifiedBy.email,
                        'timestamp':     Date.now()
                    });

                }
            }

            //console.log('readied items ' + JSON.stringify(readiedItems));

            // ADD ITEMS TO CART


            Order.find({'_id': packingList.orderId,'qtyRemaining' : {$gte : 1}},function(err,currentOrder) {

                // find returns an arrary .. findById returns a single record

                if(err) {
                    // delete packingList record
                    PackingList.findByIdAndRemove({id: packingList._id}, function(err){
                        if(!err) {
                            console.log('Error in orders');
                            res.json({status:false});
                        }
                    });
                }


                if(currentOrder) {
                    order = currentOrder[0];
                    console.log('order record found for ' + packingList.orderId);
                    //console.log('order ' + JSON.stringify(order));
                    console.log('order qty           ' + order.itemCount);
                    console.log('order qty Remaining ' + order.qtyRemaining);



                    //console.log('order items ' + JSON.stringify(order.items));
                    //console.log('readied items ' + JSON.stringify(readiedItems));

                    var updatedItems = [];

                    for (i=0; i < items.length; i++) {

                        updatedItems.push({
                            'productId':    order.items[i].productId,
                            'manufacturersName':items[i].manufacturersName,
                            'genericName':  order.items[i].genericName,
                            'packaging':    order.items[i].packaging,
                            'qty':          order.items[i].qty,
                            'qtyReadied':   getQtyReadied(readiedItems, order.items[i].productId),
                            'qtyShipped':   order.items[i].qtyShipped,
                            'qtyRemaining': order.items[i].qtyRemaining,
                            'subtotal':     order.items[i].subtotal
                        });
                    }

                    console.log('order items   ' + JSON.stringify(updatedItems));
                    console.log('readied items ' + JSON.stringify(readiedItems));

                    order.readied    = readiedItems;
                    order.items      = updatedItems;
                    order.qtyReadied = req.body.qtyReadied;
                    order.log.push({email: req.body.modifiedBy.email, date: Date.now(), comment: 'shipment readied'});

                    console.log('new order ' + JSON.stringify(order));

                    order.save(function(err) {
                        if (!err) {
                            console.log("order updated");
                            res.json(order);
                        } else {
                            res.json(false);
                            console.log(err);
                        }

                    });

                }
                else {
                    // no record with qtyRemaining > qty
                    // rollback readiedList

                    PackingList.findByIdAndRemove({id: packingList._id}, function(err){
                        if(!err) {
                            console.log('Error in orders');
                            res.json({status:false});
                        }
                        else {
                            res.json(true);
                        }
                    });
                }


            });


            // end of update Order

        }
    });



    // res.end();


};

var getQtyReadied = function(items, productId) {
    //console.log('items ' + JSON.stringify(items));

    for ( i=0; i < items.length; i++) {
        console.log(i + ' ' + 'productID ' + productId + ' item ' + items[i].productId + ' qtyReadied' + items[i].qtyReadied);

        if (items[i].productId == productId) {
            break;
        }
    }

    console.log( ' returning ' + i + ' ' + items[i].qtyReadied);
    return items[i].qtyReadied;
};
