/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),

    Product = mongoose.model('Product2s');

/**
 * Auth callback. what is this here
 */

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

exports.products = function(req,res) {
    console.log('product.find()');
    Product.find({},{}, {sort: {manufacturersName: 1}}, function(err,products) {
        if(!err) {
            res.json(products);
        }
        else {
            console.log('Error in products');
            res.redirect('/');
        }

    });
};

exports.product = function(req,res) {
    console.log('product.find()' + req.params.id);
    var id = req.params.id;
    if(id) {
        Product.findById(id, function(err,product) {
            if(!err) {
                if(product) {
                    res.json({product: product, status: true});
                }
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in products');
                res.json({status:false});
            }

        });

    }
};

exports.add = function(req,res) {

    console.log('product.add()' + JSON.stringify(req.body));

    product = new Product({
        manufacturersName: req.body.manufacturersName,
        genericName: req.body.genericName,
        packaging: req.body.packaging,
        unitPrice: req.body.unitPrice,
        qtyOnHand: req.body.qtyOnHand,
        sellFlag: req.body.sellFlag
    });

    product.save(function(err) {
        if(!err) {
            console.log('saved to file');
            res.json(req.body);
        }
        else {
            res.json(err);
        }
    });

    console.log('what are you doing here');
    res.json(req.body);

};

exports.edit = function (req, res) {
    console.log('product.edit() ' + JSON.stringify(req.body));
    console.log('product id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        Product.findById(id, function (err, product) {
            if(!err) {
                if(product) {
                    console.log('product.edit() ' + JSON.stringify(product));
                    console.log('findById ' + product.name);

                    product.manufacturersName= req.body.manufacturersName;
                    product.genericName      = req.body.genericName;
                    product.packaging        = req.body.packaging;
                    product.unitPrice        = req.body.unitPrice;
                    product.qtyOnHand        = req.body.qtyOnHand;
                    product.sellFlag         = req.body.sellFlag;

                    product.save(function (err) {
                        if (!err) {
                            res.json(true);
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });

                }   // if product
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in products');
                res.json({status:false});
            }
        });
    }
};

exports.delete = function (req, res) {

    console.log('product delete id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        Product.findById(id, function (err, product) {
            product.remove(function (err) {
              if (!err) {
                console.log("removed");
                res.json(true);
              } else {
                res.json(false);
                console.log(err);
              }
            });
        });
    }
};


exports.forsale = function(req,res) {
    console.log('forsale.find()');
    Product.find({qtyOnHand: {$gt: 0}, sellFlag: true},{}, {sort: {manufacturersName: 1, packaging:1}}, function(err,products) {
        if(!err) {
            res.json(products);
        }
        else {
            console.log('Error in products');
            res.redirect('/');
        }

    });
};

// get all items with the same manufacturers Name (has several packaging options)
exports.details = function(req,res) {
    console.log('product details by name ' + req.params.manufacturersName);
    Product.find({"manufacturersName" : req.params.manufacturersName, qtyOnHand: {$gt: 0}, sellFlag: true},{},
      {sort: {packaging: 1}}, function(err,products) {
        if(!err) {
            res.json(products);
        }
        else {
            console.log('Error in productsdetails');
            res.redirect('/');
        }

    });
};
