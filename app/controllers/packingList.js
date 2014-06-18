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
    PackingList = mongoose.model('PackingList3');



/*
exports.list          - list all packinglists
exports.add           - add readied record and update order
exports.cancel        - cancel shipment, given shipmentId
exports.delete        - delete a record in items, given shipmentId
exports.ship          - ship, status from Readied to Shipped, givenShipmentId
*/

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

exports.list = function(req, res) {
    PackingList.find ({'orderId': req.params.orderId, 'status': 0}, function(err,packingLists) {
        if(!err) {
            res.json(packingLists);
        }
        else {
            console.log('Error in packingList');
            res.redirect('/');
        }
    });
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
              qtyReadied: {type:Number}
          }],
          "status": {type:Number},       // 0 ok 1- shipped 9 -cancelled
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
            'qtyReadied':  req.body.items[i].qtyReadied
        });
    }

    packingList.items      = items;

    var readiedItems = [];

    for (i=0; i < req.body.items.length; i++) {
        if (req.body.items[i].qtyReadied > 0) {
            readiedItems.push({
                'productId':     req.body.items[i].productId,
                'qtyReadied':    req.body.items[i].qtyReadied
            });

        }
    }

    console.log('PackingListId ' + packingList._id);


    Order.findById(packingList.orderId, function(err,order) {
        if(order) {

            console.log('order qtyReadied ' + order.qtyReadied );
            console.log('packingList ' + packingList.qtyReadied);
            console.log('order qtyRemaining ' + order.qtyRemaining);

            if (order.qtyReadied + packingList.qtyReadied > order.qtyRemaining) {
                console.log('Readied items > Remaining. Saving aborted! ');
                // go home
                return res.json(order);
            }


            // this is needed to update the order.items

            var updatedItems = [];
            for (i=0; i < order.items.length; i++) {

                item = order.items[i];
                prodId = item.productId;

                oldQtyReadied =  item.qtyReadied;
                newQtyReadied =  getQtyReadied(readiedItems, prodId);
                qtyReadied    =  oldQtyReadied + newQtyReadied;

                updatedItems.push({
                    'productId':        item.productId,
                    'manufacturersName':item.manufacturersName,
                    'genericName':      item.genericName,
                    'packaging':        item.packaging,
                    'qty':              item.qty,
                    'qtyReadied':       qtyReadied,
                    'qtyShipped':       item.qtyShipped,
                    'qtyRemaining':     item.qtyRemaining,
                    'unitPrice':        item.unitPrice,
                    'subTotal':         item.subTotal
                });

            }

            order.items      = updatedItems;      // overlay exisiting items with new qtyReadied
            // add more records to order.readied...

            for (i=0; i < req.body.items.length; i++) {
                if (req.body.items[i].qtyReadied > 0) {
                    order.readied.push({
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


            order.qtyReadied = order.qtyReadied + req.body.qtyReadied;

            comment = 'packing list readied for ' + req.body.qtyReadied + ' items. total items in various packing lists ' + order.qtyReadied;
            order.log.push({email: req.body.modifiedBy.email, date: Date.now(), comment: comment });

            order.save(function(err) {
                if(!err) {
                    console.log('Updated order ' + packingList.orderId);
                    packingList.save(function(err) {
                        if(!err) {
                            console.log('packingList record added!' + packingList._id);
                            return res.json(order);
                        }
                    });
                }
            });


        }

    });
};


exports.cancel = function(req, res) {

    //console.log('Cancel Info ' + JSON.stringify(req.body));

    cancelledItems = req.body.items;
    qtyCancelled   = req.body.qtyCancelled;
    cancelledId    = req.body.readiedId;

    Order.findById(req.body.orderId, function(err,order) {
        if(order) {

            //console.log('Order ' + order.qtyReadied + ' qty Cancelled ' + req.body.qtyCancelled) ;

            order.qtyReadied = order.qtyReadied - req.body.qtyCancelled;

            // reduce items.qtyReadied from packingList.qtyReadied

            var updatedItems = [];
            for (i=0; i < order.items.length; i++) {

                item = order.items[i];

                prodId = item.productId;

                oldQtyReadied    =  item.qtyReadied;
                deductQtyReadied =  getQtyReadied(cancelledItems, prodId);
                qtyReadied       =  oldQtyReadied - deductQtyReadied;

                updatedItems.push({
                    'productId':        item.productId,
                    'manufacturersName':item.manufacturersName,
                    'genericName':      item.genericName,
                    'packaging':        item.packaging,
                    'qty':              item.qty,
                    'qtyReadied':       qtyReadied,
                    'qtyShipped':       item.qtyShipped,
                    'qtyRemaining':     item.qtyRemaining,
                    'unitPrice':        item.unitPrice,
                    'subTotal':         item.subTotal
                });

            }

            order.items      = updatedItems;      // overlay exisiting items with new qtyReadied

            // delete records in items.readied where readiedId

            var readiedItems = [];
            for (i=0; i < order.readied.length; i++) {
                if (checkIds(order.readied[i].readiedId, cancelledId) > 0) {
                    readiedItems.push({
                        'readiedId':        order.readied[i].readiedId,
                        'productId':        order.readied[i].productId,
                        'manufacturersName':order.readied[i].manufacturersName,
                        'genericName':      order.readied[i].genericName,
                        'packaging':        order.readied[i].packaging,
                        'qty':              order.readied[i].qty,
                        'qtyReadied':       order.readied[i].qtyReadied,
                        'qtyShipped':       order.readied[i].qtyShipped,
                        'shippingClerk':    order.readied[i].shippingClerk,
                        'timestamp':        order.readied[i].timestamp
                    });
                }
            }

            order.readied = readiedItems;

            comment = 'packing list cancelled reason: <'+ req.body.reason + '>. qty cancelled ' + qtyCancelled + ', available qty packed ' + order.qtyReadied;

            order.log.push({email: req.body.email, date: Date.now(), comment: comment });

            //console.log('About to save ' + JSON.stringify(order));


            order.save(function(err) {
                if(!err) {
                    console.log('Updated order ' + req.body.orderId);
                    PackingList.findById(req.body.readiedId, function(err, packingList) {
                        if(!err) {
                            var cancelInfo = {
                                info: String,
                                email: String,
                                date: Date
                            };

                            cancelInfo.info  = req.body.reason;
                            cancelInfo.email = req.body.email;
                            cancelInfo.date  = Date.now();

                            packingList.status = 1;
                            packingList.cancelledBy = cancelInfo;

                            packingList.save(function(err) {
                                if(!err) {
                                    console.log('packing List cancelled');
                                    return res.json(order);
                                }
                                else {
                                    console.log('Error in updating packing list');
                                    return res.json(order);
                                }
                            });
                        }

                    });
                }
                else {
                    console.log("Error in updating order " + err);
                    return res.json(order);
                }
            });


        }

    });
};


var checkIds = function(itemReadiedId, readyId) {


    var ret = 1;

    itemRId = itemReadiedId.toString();

    //console.log('packingList.Id ' + readyId + ' item[].readied ' + itemRId);
    if (readyId.localeCompare(itemRId) === 0 ) {
        ret = 0;
    }


    //console.log('\tret  ' + ret );
    return ret;
};

var getQtyReadied = function(readyItems, productId) {

    var retQty = 0;
    prodId = productId.toString();

    //console.log('\t\tfor getQtyReadied prodId ' + prodId);
    var j = 0;

    while (j < readyItems.length ) {
        rdyItem= readyItems[j];
        iD     = rdyItem.productId;
        itemId = iD.toString();

        //console.log('\t\tj  = ' + j + ' itemId ' + itemId);


        if(prodId.localeCompare(itemId) === 0) {
            //console.log('\t\tPAREHO');
            retQty = rdyItem.qtyReadied;
            break;
        }
        j++;
    }



   // console.log('\t\tretQty ' + retQty);

    return retQty;

};
