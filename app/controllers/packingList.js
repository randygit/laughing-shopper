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

    packingList.save(function(err) {
        if (err) {
            console.log('error in saving ' + err);
            return res.json(err);
        }
        else {

            var readiedItems = [];

            /*
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
            */
            for (i=0; i < req.body.items.length; i++) {
                if (req.body.items[i].qtyReadied > 0) {
                    readiedItems.push({
                        'productId':     req.body.items[i].productId,
                        'qtyReadied':    req.body.items[i].qtyReadied
                    });

                }
            }

            console.log('readiedItems ' + JSON.stringify(readiedItems));


            Order.find({'_id': packingList.orderId,'qtyRemaining' : {$gte : 1}},function(err,currentOrder) {

                // find returns an arrary .. findById returns a single record

                if(err) {
                    PackingList.findByIdAndRemove({id: packingList._id}, function(err){
                        if(!err) {
                            console.log('Error in orders');
                            res.json({status:false});
                        }
                    });
                }


                if(currentOrder) {
                    order = currentOrder[0];
                    //console.log('order record found for ' + packingList.orderId);

                    var updatedItems = [];

                    // update items[] in order. set qtyReadied = qtyReadied + readiedItems.qtyReadied

                    // console.log(' Items ' + JSON.stringify(items));

                    for (i=0; i < order.items.length; i++) {

                        item = order.items[i];

                        console.log('i = ' + i + ' Product ' +item.productId + ' ' + item.manufacturersName + ' ' + item.qtyReadied);

                        prodId = item.productId;

                        oldQtyReadied =  item.qtyReadied;
                        newQtyReadied =  getQtyReadied(readiedItems, prodId);
                        qtyReadied    =  oldQtyReadied + newQtyReadied;
                        console.log('item ' + JSON.stringify(item));

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

                        console.log('About to loop back for i = ' + i);

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
                    order.log.push({email: req.body.modifiedBy.email, date: Date.now(), comment: 'shipment readied'});

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

var getQtyReadied = function(readyItems, productId) {
    /*
    console.log('\tgetQtyReadied product Id ' + productId);
    console.log('\tgetQtyReadied items      ' + JSON.stringify(items));
    console.log('\tgetQtyReadied length     ' + items.length);
    */

    var retQty = 0;
    prodId = productId.toString();

    for(j=0; j < readyItems.length; j++) {
        rdyItem= readyItems[j];
        iD     = rdyItem.productId;
        itemId = iD.toString();

        //console.log('\t\tj for getQtyReadied = ' + j + ' itemId ' + itemId + ' prodId ' + prodId);


        if(prodId.localeCompare(itemId) === 0) {
            //console.log('\t\tPAREHO');
            retQty = rdyItem.qtyReadied;
        }
    }



    console.log('\t\tretQty ' + retQty);

    return retQty;

};

var tulogNa = function(x) {
  j = 0;
  for(i=0;i< x; i++) {
      j = j + i;
  }
};
