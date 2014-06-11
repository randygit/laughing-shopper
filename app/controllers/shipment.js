/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer'),
    Schema = mongoose.Schema,

    Order = mongoose.model('Order15');
    Shipment = mongoose.model('Shipment3');

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
