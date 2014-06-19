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
    Shipment = mongoose.model('Shipment11');
    PackingList = mongoose.model('PackingList3');


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

    //console.log('ADDING' + JSON.stringify(req.body));

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
                'productId': req.body.items[i].productId,
                'qty':       req.body.items[i].qtyReadied
            });

        }
    }

    //console.log('PackingListId ' + packingList._id);


    Order.findById(packingList.orderId, function(err,order) {
        if(order) {


            if (typeof packingList.qtyReadied === 'undefined') {
                console.log('Method 1. Readied items > Remaining. Saving aborted! ');
                return res.json(order);

            }

            if(! packingList.qtyReadied) {
                console.log('Method 2. Readied items > Remaining. Saving aborted! ');
                return res.json(order);

            }

            totQtyReadied = order.qtyReadied + packingList.qtyReadied;

            console.log('order qtyReadied   ' + order.qtyReadied );
            console.log('packingList        ' + packingList.qtyReadied);
            console.log('Total qtyReadied   ' + totQtyReadied);
            console.log('order qtyRemaining ' + order.qtyRemaining);

            if (totQtyReadied > order.qtyRemaining) {
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

            var updatedReadiedItems = [];
            for (i=0; i < order.readied.length; i++) {
                if (checkIds(order.readied[i].readiedId, cancelledId) > 0) {
                    updatedReadiedItems.push({
                        'readiedId':        order.readied[i].readiedId,
                        'productId':        order.readied[i].productId,
                        'manufacturersName':order.readied[i].manufacturersName,
                        'genericName':      order.readied[i].genericName,
                        'packaging':        order.readied[i].packaging,
                        'qty':              order.readied[i].qty,
                        'qtyReadied':       order.readied[i].qtyReadied,
                        'qtyShipped':       order.readied[i].qtyShipped,
                        'shippingClerk':    req.body.email,
                        'timestamp':        Date.now()
                    });
                }
            }

            order.readied = updatedReadiedItems;

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

                            packingList.status = 9;     // 0- ok. 1- shipped 9 -cancelled
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

exports.ship = function(req, res) {
    console.log('SHIP' + JSON.stringify(req.body));


        var shipment = new Shipment({
            "deliveryRef": String,
            "shipmentDate": {type:Date},
            "orderId": {type:Schema.Types.ObjectId},
            "readiedId": {type:Schema.Types.ObjectId},
            "orderDate": {type:Date},
            "orderRef":String,
            "customerName": String,
            "customerEmail":String,
            "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                        "city": String, "state": String, "country": String, "zipcode": String},
            "qtyShipped": {type:Number},
            "items": [{
                productId: {type:Schema.Types.ObjectId},
                manufacturersName: String,
                genericName: String,
                packaging: String,
                qtyShipped: {type:Number},
                unitPrice: {type:Number}
                }],
            "status": {type:Number},         // 0 ok 9 cancelled
            "cancelledBy":  {"info": String, "email": String, "date":{type:Date}},
            "shipmentRef":  {"email": String, "date": {type:Date}, "details": String, "when": String, "by":String},
            "trackingInfo": {"company": String, "trackingNumber": String, "status": String, "estDeliveryDate": {type:Date}}
        });

        var info = {
            email:String,
            date: Date,
            details:String,
            when: String,
            by: String
        };

        info.email   = req.body.email;
        info.date    = Date.now();
        info.details = req.body.details;
        info.when    = req.body.when;
        info.by      = req.body.by;

        shipment.deliveryRef  = 'DR1001';
        shipment.shipmentDate = Date.now();
        shipment.orderId      = req.body.orderId;
        shipment.readiedId    = req.body.readiedId;
        shipment.qtyShipped    = req.body.qtyReadied;
        shipment.status       = 0;
        shipment.shipmentRef  = info;



        var shippedItems = [];
        for (i=0; i < req.body.items.length; i++) {
            item = req.body.items[i];
            if(item.qtyReadied > 0) {
                shippedItems.push({
                    'productId':        item.productId,
                    'manufacturersName':item.manufacturersName,
                    'genericName':      item.genericName,
                    'packaging':        item.packaging,
                    'qtyShipped':       item.qtyReadied
                });

            }
        }

        shipment.items = shippedItems;

        var readiedItems = [];
        for (i=0; i < req.body.items.length; i++) {
            if (req.body.items[i].qtyReadied > 0) {
                readiedItems.push({
                    'productId':     req.body.items[i].productId,
                    'qty':    req.body.items[i].qtyReadied
                });

            }
        }


        Order.findById(req.body.orderId, function(err,order) {
            if(order) {


                shipment.orderRef =      order.orderRef;
                shipment.orderDate =     order.orderDate;
                shipment.customerName =  order.customerName;
                shipment.customerEmail = order.customerEmail;
                shipment.shipto        = order.shipto;
                shipment.shippingMode  = order.shippingMode;

                console.log('PackingList.qtyReadied ' + req.body.qtyReadied);
                console.log('order.qtyReadied       ' + order.qtyReadied);
                console.log('order.qtyShipped       ' + order.qtyShipped);
                console.log('order.qtyRemaining     ' + order.qtyRemaining);

                order.qtyReadied   = order.qtyReadied - req.body.qtyReadied;
                order.qtyShipped   = order.qtyShipped  + req.body.qtyReadied;
                order.qtyRemaining = order.qtyRemaining - req.body.qtyReadied;

               // this is needed to update the order.items

                var updatedItems = [];
                for (i=0; i < order.items.length; i++) {

                    item = order.items[i];
                    prodId = item.productId;


                    newQtyReadied =  getQtyReadied(readiedItems, prodId);
                    qtyReadied    =  item.qtyReadied - newQtyReadied;
                    qtyShipped    =  item.qtyShipped + newQtyReadied;
                    qtyRemaining  =  item.qtyRemaining - newQtyReadied;

                    updatedItems.push({
                        'productId':        item.productId,
                        'manufacturersName':item.manufacturersName,
                        'genericName':      item.genericName,
                        'packaging':        item.packaging,
                        'qty':              item.qty,
                        'qtyReadied':       qtyReadied,
                        'qtyShipped':       qtyShipped,
                        'qtyRemaining':     qtyRemaining,
                        'unitPrice':        item.unitPrice,
                        'subTotal':         item.subTotal
                    });

                }

                order.items = updatedItems;


                // delete records in order.readied and transfer them to order.shipment
                var updatedReadiedItems = [];
                for (i=0; i < order.readied.length; i++) {
                    if (checkIds(order.readied[i].readiedId, req.body.readiedId) > 0) {
                        updatedReadiedItems.push({
                            'readiedId':        order.readied[i].readiedId,
                            'productId':        order.readied[i].productId,
                            'manufacturersName':order.readied[i].manufacturersName,
                            'genericName':      order.readied[i].genericName,
                            'packaging':        order.readied[i].packaging,
                            'qty':              order.readied[i].qty,
                            'qtyReadied':       order.readied[i].qtyReadied,
                            'qtyShipped':       order.readied[i].qtyShipped,
                            'shippingClerk':    req.body.email,
                            'timestamp':        Date.now()
                        });
                    }
                }

                order.readied = updatedReadiedItems;
                console.log('ShipmentID ' + shipment._id);

                for (i=0; i < req.body.items.length; i++) {
                    if (req.body.items[i].qtyReadied > 0) {
                        order.shipped.push({
                            'shipmentId':   shipment._id,
                            'productId':     req.body.items[i].productId,
                            'manufacturersName':req.body.items[i].manufacturersName,
                            'genericName':   req.body.items[i].genericName,
                            'packaging':     req.body.items[i].packaging,
                            'qtyShipped':    req.body.items[i].qtyReadied,
                            'shippingClerk': req.body.email,
                            'timestamp':     Date.now()
                        });

                    }
                }

                comment = 'shipment made: <'+ req.body.details + '>. qty shipped ' + req.body.qtyReadied;

                order.log.push({email: req.body.email, date: Date.now(), comment: comment });


                order.save(function(err) {
                    if(!err) {
                        console.log('Updated order ' + req.body.orderId);
                        PackingList.findById(req.body.readiedId, function(err, packingList) {
                            if(!err) {

                                packingList.status = 1;     // 0- ok. 1- shipped 9 -cancelled

                                packingList.save(function(err) {
                                    if(!err) {
                                        console.log('packing List cancelled');
                                        shipment.save(function(err) {
                                            if (!err) {
                                                console.log('shipping record saved');
                                                return res.json(order);
                                            }
                                            else {
                                                console.log('Error in saving shipping Record');
                                                return res.json(order);
                                            }

                                        });
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

            } // if order


        });

};


exports.cancelShipment = function(req, res) {

    //console.log('Cancel Info ' + JSON.stringify(req.body));

    //cancelledItems = req.body.items;
    qtyCancelled   = req.body.qtyCancelled;
    cancelledId    = req.body.shippedId;


    var cancelledItems = [];
    for (i=0; i < req.body.items.length; i++) {
        if (req.body.items[i].qtyShipped > 0) {
            cancelledItems.push({
                'productId': req.body.items[i].productId,
                'qty':       req.body.items[i].qtyShipped
            });

        }
    }


    Order.findById(req.body.orderId, function(err,order) {
        if(order) {

            order.qtyRemaining = order.qtyRemaining + req.body.qtyCancelled;
            order.qtyShipped   = order.qtyShipped   - req.body.qtyCancelled;

            var updatedItems = [];
            for (i=0; i < order.items.length; i++) {

                item = order.items[i];

                prodId = item.productId;

                deductQtyShipped =  getQtyReadied(cancelledItems, prodId);
                qtyShipped       =  item.qtyShipped - deductQtyShipped;
                qtyRemaining     =  item.qtyRemaining + deductQtyShipped;

                updatedItems.push({
                    'productId':        item.productId,
                    'manufacturersName':item.manufacturersName,
                    'genericName':      item.genericName,
                    'packaging':        item.packaging,
                    'qty':              item.qty,
                    'qtyReadied':       item.qtyReadied,
                    'qtyShipped':       qtyShipped,
                    'qtyRemaining':     qtyRemaining,
                    'unitPrice':        item.unitPrice,
                    'subTotal':         item.subTotal
                });

            }

            order.items      = updatedItems;      // overlay exisiting items with new qtyReadied

            // delete records in items.readied where readiedId

            var shippedItems = [];
            for (i=0; i < order.shipped.length; i++) {
                if (checkIds(order.shipped[i].shipmentId, cancelledId) > 0) {
                    shippedItems.push({
                        'shipmentId':       order.shipped[i].shipmentId,
                        'productId':        order.shipped[i].productId,
                        'manufacturersName':order.shipped[i].manufacturersName,
                        'genericName':      order.shipped[i].genericName,
                        'packaging':        order.shipped[i].packaging,
                        'qty':              order.shipped[i].qty,
                        'qtyReadied':       order.shipped[i].qtyReadied,
                        'qtyShipped':       order.shipped[i].qtyShipped,
                        'shippingClerk':    req.body.email,
                        'timestamp':        Date.now()
                    });
                }
            }

            order.shipped = shippedItems;

            comment = 'Shipment cancelled reason: <'+ req.body.reason + '>. qty cancelled ' + qtyCancelled + ', available qty packed ' + order.qtyRemaining;

            order.log.push({email: req.body.email, date: Date.now(), comment: comment });

            //console.log('About to save ' + JSON.stringify(order));


            order.save(function(err) {
                if(!err) {
                    console.log('Updated order ' + req.body.orderId);
                    Shipment.findById(req.body.shippedId, function(err, shipment) {
                        if(!err) {
                            var cancelInfo = {
                                info: String,
                                email: String,
                                date: Date
                            };


                            cancelInfo.info  = req.body.reason;
                            cancelInfo.email = req.body.email;
                            cancelInfo.date  = Date.now();

                            shipment.status = 9;     // 0- ok. 1- shipped 9 -cancelled
                            shipment.cancelledBy = cancelInfo;

                            shipment.save(function(err) {
                                if(!err) {
                                    console.log('shipment cancelled');
                                    return res.json(order);
                                }
                                else {
                                    console.log('Error in cancelling shipment');
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

    if (readyId.localeCompare(itemRId) === 0 ) {
        ret = 0;
    }

    return ret;
};

var getQtyReadied = function(readyItems, productId) {

    var retQty = 0;
    prodId = productId.toString();


    var j = 0;

    while (j < readyItems.length ) {
        rdyItem= readyItems[j];
        iD     = rdyItem.productId;
        itemId = iD.toString();
        if(prodId.localeCompare(itemId) === 0) {
            retQty = rdyItem.qty;
            break;
        }
        j++;
    }
    return retQty;

};
