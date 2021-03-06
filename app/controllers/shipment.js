/**
 * Module dependencies.

    events:
    0. create record (by shippingDock)  shipmentQty <= order.ItemsCount - order.QtyShipped
    1. view all shipment for given orderId
    2. view all shipment for given email
    3. view all shipments
    4. cancel this shipment
    5. print DR
    6. email customer again??

 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer'),
    Schema = mongoose.Schema,

    Order = mongoose.model('Order26');
    Shipment = mongoose.model('Shipment11');


/*
exports.shipments     - list all shipments, pass the status, email (could be all)
exports.add           - add a shipment
exports.shipment      - get a shipment record given shipmentId
exports.edit          - update shipment a record in items given shipmentId
exports.cancel        - cancel shipment, given shipmentId
exports.delete        - delete a record in items, given shipmentId
exports.ship          - ship, status from Readied to Shipped, givenShipmentId
*/

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};


exports.list = function(req, res) {
    console.log('shipment.list ' + req.params.orderId);

    Shipment.find ({'orderId': req.params.orderId, 'status': 0}, function(err,shipments) {
        if(!err) {
            res.json(shipments);
        }
        else {
            console.log('Error in shipmentList');
            res.redirect('/');
        }
    });
};
