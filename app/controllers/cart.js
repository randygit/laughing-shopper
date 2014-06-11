/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),

    Cart = mongoose.model('Cart2');

/**
 * Auth callback. what is this here
 */

/*
  exports.carts - get all items in cart for a given email
  exports.cart  - get a single item in cart using cart id as key
  exports.add  - add another item to cart of email
  exports.edit - edits record of the item in cart using cart id as key
  exports.delete - delete record of an item in cart using cart Id as key
  exports.summary - determines number of items and total of cart for given email

*/
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

// email is the key
exports.items = function(req,res) {
    console.log('cart.find()');
    Cart.find({"email":req.params.email},{},  {sort: {manufacturersName: 1, packaging:1}} , function(err,items) {
        if(!err) {
            // console.log('cart.items ' + JSON.stringify(items))
            res.json(items);
        }
        else {
            console.log('Error in items');
            res.redirect('/');
        }

    });
};

// there is only one cart per email

exports.cart = function(req,res) {
    console.log('cart.find()' + req.params.id);
    var id = req.params.id;
    if(id) {
        Cart.findById(id, function(err,cart) {
            if(!err) {
                if(cart) {
                    res.json({cart: cart, status: true});
                }
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in carts');
                res.json({status:false});
            }

        });

    }
};

exports.add = function(req,res) {

    // check if the same productID exists in shopping cart
    // if yes, update that record, add new qty to existing

    //console.log('cart.add or update ' + JSON.stringify(req.body));
    Cart.find({ 'email': req.body.email, 'productId': req.body.productId }, function(err,cart) {
        if(!err) {
            if (cart.length ===1 ) {
                item = cart[0];
                // update this record
                console.log('Cart.update ' + JSON.stringify(item));

                item.email            = req.body.email;
                item.productId        = req.body.productId;
                item.manufacturersName= req.body.manufacturersName;
                item.genericName      = req.body.genericName;
                item.packaging        = req.body.packaging;
                item.unitPrice        = req.body.unitPrice;

                item.qty              = item.qty + req.body.qty;
                item.subTotal         = item.subTotal + req.body.subTotal;

                console.log('Cart.update + qty ' + JSON.stringify(item));

                item.save(function (err) {
                    if (!err) {
                        res.json(true);
                        console.log("updated");
                    } else {
                        res.json(false);
                        console.log(err);
                    }
                });
            }
            else {
                console.log('Cart.add -> cart.insert() ');

                cart = new Cart({
                    email: req.body.email,
                    productId: mongoose.Types.ObjectId(req.body.productId),
                    manufacturersName: req.body.manufacturersName,
                    genericName: req.body.genericName,
                    packaging: req.body.packaging,
                    unitPrice: req.body.unitPrice,
                    qty: req.body.qty,
                    subTotal: req.body.subTotal
                });

                cart.save(function(err) {
                    if(!err) {
                        console.log('saved to file');
                        res.json(req.body);
                    }
                    else {
                        res.json(err);
                    }
                });
            }
        }
        else {
            console.log('Error in carts.find()');
            res.json({status:false});
        }
    });

    res.json(req.body);
};

exports.edit = function (req, res) {
    //console.log('cart.edit() ' + JSON.stringify(req.body));
    //console.log('cart id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        Cart.findById(id, function (err, cart) {
            if(!err) {
                if(cart) {
                    //console.log('cart.edit() ' + JSON.stringify(cart));
                    //console.log('Cart.edit() - findById ' + cart.email);

                    cart.email            = req.body.email;
                    cart.productId        = req.body.productId;
                    cart.manufacturersName= req.body.manufacturersName;
                    cart.genericName      = req.body.genericName;
                    cart.packaging        = req.body.packaging;
                    cart.unitPrice        = req.body.unitPrice;
                    cart.qty              = req.body.qty;
                    cart.subTotal         = req.body.subTotal;

                    cart.save(function (err) {
                        if (!err) {
                            res.json(true);
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });

                }   // if cart
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in carts');
                res.json({status:false});
            }
        });
    }
};

exports.delete = function (req, res) {

    //console.log('cart delete id ' + req.params.id);
    var id = req.params.id;
    if (id) {
        Cart.findById(id, function (err, cart) {
            cart.remove(function (err) {
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


exports.clear = function (req, res) {

    console.log('clear cart' + req.params.email);
    Cart.find({ 'email': req.params.email}).remove().exec();
};

// computes total items, total amount for given email
exports.summary = function(req,res) {
    console.log('cart.summary() for ' + req.params.email);

    var conditions = {
        "email":req.params.email
    };

    var summary = {
      count: Number,
      total: Number
    };

    Cart.count({"email":req.params.email}, function(err, count) {
        if(!err) {
            //console.log('Shopping Cart item count is ' + count);
	          summary.count = count;


            Cart.aggregate(
                {
                    $match: {"email": req.params.email}
                },
                {
                    $project: {
                        _id: 0,
                        "email":1,
                        qty:1,
                        unitPrice:1,
                        subTotal:1
                    }
                },
                {
                    $group: {
                        _id: '$email',
                        lineCount: {$sum: 1},
                        itemCount: {$sum: '$qty'},
                        subtotal: {$sum: '$subTotal'}
                    }
                },
                function(err, summary) {
                    if(!err) {
                        // console.log('Totals ' + JSON.stringify(summary));
	                      res.json(summary);
                    }
                    else {
                        console.log('Error in aggregate');
	                      res.json(err);
                    }
                }

            );


        }
        else {
            console.log('Error in carts');
	          res.json(err);
        }

    });


};
