/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mailer = require('../../config/mailer'),
    Schema = mongoose.Schema,

    Order = mongoose.model('Order26');

/**
 * Auth callback. what is this here
 */


exports.authCallback = function(req, res, next) {
    res.redirect('/');
};


exports.order = function(req,res) {
    //console.log('order.find()' + req.params.id);
    var id = req.params.id;
    if(id) {
        Order.findById(id, function(err,order) {
            if(!err) {
                if(order) {
                    res.json(order);
                }
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in orders');
                res.json({status:false});
            }

        });

    }
};

exports.getWuCount = function(req,res) {

    //console.log('getWuCount for ' + req.params.email);


    var summary = {
      count: Number,
      total: Number
    };

    Order.count({'customerEmail':req.params.email, 'status': 0, 'paymentMode': 'WU'},function(err, count) {
        if(!err) {
            //console.log('getWuCount is ' + count);
            summary.count = count;
            res.json(summary);
        }

    });
};

exports.wuOrders = function(req,res) {
    Order.find({'customerEmail':req.params.email, 'status': 0, 'paymentMode': 'WU'},
        {orderDate:1,totalAmount:1, shippingCharges:1, grandTotal:1 }, {sort: {orderDate: 1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders');
                res.redirect('/');
            }
    });
};

exports.verifyWuOrders = function(req,res) {
    Order.find({'status': 1, 'paymentMode': 'WU'},
        {orderDate:1,customerEmail:1, totalAmount:1, shippingCharges:1, grandTotal:1, paymentRef:1 }, {sort: {orderDate: 1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders');
                res.redirect('/');
            }
    });
};

exports.verifyWuOrder = function (req, res) {
    console.log('orderId ' + req.params.id);
    //console.log('mtcnInfo ' + JSON.stringify(req.body));

    var id = req.params.id;
    if (id) {
       Order.findById(id, function (err, Order) {
            if(!err) {
                if(Order) {


                    Order.status = 3;     // ready for shipment
                    Order.verifiedBy.info  = req.body.info;
                    Order.verifiedBy.amount  = req.body.amount;
                    Order.verifiedBy.email = req.body.email;
                    Order.verifiedBy.date  = Date.now();

                    // how to add to log
                    var remarks = 'MTCN ' + Order.paymentRef.info + ' verified. amount ' + req.body.amount + ' ' + req.body.info;

                    Order.log.push({email:req.body.email, comment:remarks, date: Date.now()});

                    Order.save(function (err) {
                        if (!err) {
                            //EMAIL here MTCN has been verified, order is now being processed
                            sendMtcnEmail(req, Order,'MTCN ' + Order.paymentRef.info + ' verified! Order being processed.','mtcnverified' );
                            res.json(true);
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });

                }   // if Order
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in Users');
                res.json({status:false});
            }
        });
    }
};

// works log.push
exports.disapproveWuOrder = function (req, res) {
    console.log('disapprove orderId ' + req.params.id);
    //console.log('disapprove mtcnInfo ' + JSON.stringify(req.body));

    var id = req.params.id;
    if (id) {
       Order.findById(id, function (err, Order) {
            if(!err) {
                if(Order) {


                    paymentMTCN = Order.paymentRef.info;

                    Order.status = 0;     // await new MTCN
                    Order.paymentRef.info = '';
                    Order.paymentRef.date = '';
                    Order.paymentRef.email = '';

                    Order.verifiedBy.info    = '';
                    Order.verifiedBy.amount  = 0;
                    Order.verifiedBy.email   = '';
                    Order.verifiedBy.date    = '';

                    // how to add to log
                    var remarks = 'MTCN disapproved ' + req.body.info;

                    Order.log.push({email:req.body.email, comment:remarks, date: Date.now()});

                    Order.save(function (err) {
                        if (!err) {
                            Order.paymentRef.info = paymentMTCN;
                            sendMtcnEmail(req, Order,'MTCN ' + paymentMTCN + ' could not be verified','mtcndisapproved' );
                            res.json(true);
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });

                }   // if Order
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in Users');
                res.json({status:false});
            }
        });
    }
};



// update with mtcn info, email, date now, status = 1 (mtcn entered)
exports.wuOrder = function (req, res) {
    console.log('orderId ' + req.params.id);
    //console.log('mtcnInfo ' + JSON.stringify(req.body));

    var id = req.params.id;
    if (id) {
       Order.findById(id, function (err, Order) {
            if(!err) {
                if(Order) {


                    Order.status = 1;     // MTCN entered, ready for verification
                    Order.paymentRef.info  = req.body.mtcn;
                    Order.paymentRef.email = req.body.email;
                    Order.paymentRef.date  = Date.now();

                    var remarks = 'MTCN ' + req.body.mtcn + ' entered ';
                    Order.log.push({email:req.body.email, comment:remarks, date: Date.now()});

                    Order.save(function (err) {
                        if (!err) {
                            res.json(true);
                            // send email here
                            sendMtcnEmail(req, Order,'Thank you for updating your order with MTCN ' + Order.paymentRef.info,'mtcnentered' );
                            console.log("updated");
                        } else {
                            res.json(false);
                            console.log(err);
                        }
                    });

                }   // if Order
                else {
                    res.json({status:false});
                }
            }
            else {
                console.log('Error in Users');
                res.json({status:false});
            }
        });
    }
};

exports.add = function(req,res) {

    //console.log('order.add()' + JSON.stringify(req.body));

    order = new Order({
        "orderDate": {type:Date},       // had to explicitly do {type:date} else cast error
        "orderRef":String,
        "customerName": String,
        "customerEmail":String,
        "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                    "city": String, "state": String, "country": String, "zipcode": String},
        "countryName": String,
        "paymentMode": String,
        "itemCount": {type:Number},
        "qtyReadied":{type:Number},
        "qtyShipped":{type:Number},
        "qtyRemaining":{type:Number},
        "totalAmount": {type:Number}, // had to explicitly do {type:date} else cast error on numbers
        "shippingCharges":{type:Number},
        "grandTotal": {type:Number},
        "ccdetails": {"cardtype": { type:String}, "cardnum":  { type:String}, "expirymonth": { type:String},
                      "expiryyear":  { type:String}, "cardcvv": { type:String}},
        "ccowner" : {"fullname":  { type:String}, "address1": { type:String}, "address2": { type:String},"address3": { type:String},"city":  { type:String}, "state": { type:String}, "country": { type:String}, "zipcode": {type:String}},
        "items": [{
                  productId: Schema.Types.ObjectId,
                  manufacturersName: String,
                  genericName: String,
                  packaging: String,
                  unitPrice: {Type:Number},
                  qty: {Type:Number},
                  qtyReadied: {Type:Number},
                  qtyShipped: {Type:Number},
                  qtyRemaining: {Type:Number},
                  subTotal: {Type:Number}
                  }],
         "paymentRef":  {"info": String, "email": String, "date": {Type:Date}},
         "status":{type:Number},
         "shippingMode": String,
         "log": [{"email": String, "date": {Type:Date}, "comment": String}]
    });

    order.customerName    = req.body.name;
    order.orderDate       = req.body.orderDate;
    order.orderRef        = req.body.orderRef;
    order.customerEmail   = req.body.customerEmail;
    order.shipto          = req.body.shipto;
    order.paymentMode     = req.body.paymentMode;
    order.itemCount       = req.body.itemCount;
    order.totalAmount     = req.body.totalAmount;
    order.shippingCharges = req.body.shippingCharges;
    order.grandTotal      = req.body.grandTotal;
    order.ccdetails       = req.body.ccdetails;
    order.paymentRef      = req.body.paymentRef;
    order.shippingMode    = req.body.shippingMode;

    order.ccowner         = req.body.ccowner;
    order.status          = req.body.status;

    order.shippingMode    = req.body.shippingMode;

    order.log = req.body.log;

    // for shipment
    order.qtyReadied = 0;
    order.qtyShipped = 0;
    order.qtyRemaining = req.body.itemCount;


    // order.items           = req.body.items; but populate first
    var items = [];

    for (i=0; i < req.body.items.length; i++) {
        //console.log('Product Name' + req.body.items[i].manufacturersName);

        items.push({
            'productId': req.body.items[i].productId,
            'manufacturersName':req.body.items[i].manufacturersName,
            'genericName':req.body.items[i].genericName,
            'packaging':req.body.items[i].packaging,
            'qty':req.body.items[i].qty,
            'qtyReadied': 0,
            'qtyShipped': 0,
            'qtyRemaining':req.body.items[i].qty,
            'unitPrice':req.body.items[i].unitPrice,
            'subTotal':req.body.items[i].subTotal
        });
    }

    order.items = items;

    order.save(function(err) {
        if (err) {
            console.log('error in saving ' + err);
            return res.json(err);
        }
        else {
            sendConfirmOrderEmail(req,  order);

        }
    });


    res.end();

};


exports.orderDeliveryList = function(req,res) {

    //Order.find({ 'status': 3, 'qtyRemaining': {$gte: 1}},
    Order.find({ 'status': 3},
        {orderDate:1,customerName: 1, customerEmail:1, shipto:1, itemCount:1, qtyReadied:1, qtyShipped:1, qtyRemaining:1, items:1 },
        {sort: {orderDate: -1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders');
                res.redirect('/');
            }
    });
};

exports.postedShipment = function(req,res) {

    Order.find({ 'status': 3, 'qtyRemaining': 0},
        {orderDate:1,customerName: 1, customerEmail:1, itemCount:1, qtyReadied:1, qtyShipped:1,items:1 },
        {sort: {orderDate: -1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders');
                res.redirect('/');
            }
    });
};

exports.customerHistoricalOrders = function(req,res) {

    Order.find({ 'customerEmail': req.params.email, 'status': 3, 'qtyRemaining': 0},
        {orderDate:1,customerName: 1, customerEmail:1, itemCount:1, qtyReadied:1, qtyShipped:1,items:1 },
        {sort: {orderDate: 1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders ' + err );
                res.redirect('/');
            }
    });
};



exports.customerPendingShipment = function(req,res) {

    console.log('customerPendingShipment ' + req.params.email);

    //Order.find({ 'customerEmail': req.params.email, 'status': 3, 'qtyRemaining': {gte:1}},
    Order.find({ 'customerEmail': req.params.email, 'status': 3},
        {orderDate:1,customerName: 1, customerEmail:1, shipto:1, itemCount:1, qtyReadied:1, qtyShipped:1, qtyRemaining:1, items:1 },
        {sort: {orderDate: -1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders ' + err);
                res.redirect('/');
            }
    });
};


/*

exports.customerCancelledOrders = function(req,res) {

    Order.find({ 'email': req.params.email, 'status': 9},
        {orderDate:1,customerName: 1, customerEmail:1, itemCount:1, qtyReadied:1, qtyShipped:1,items:1 },
        {sort: {orderDate: -1}},
        function(err,orders) {
            if(!err) {
                //console.log('Orders ' + JSON.stringify(orders));
                res.json(orders);
            }
            else {
                console.log('Error in orders');
                res.redirect('/');
            }
    });
};

*/

var sendConfirmOrderEmail = function(req, order) {

    var paymentMode ='';
    var orderMsg = '';

    if (order.paymentMode.localeCompare('WU') === 0) {
        paymentMode = 'thru Western Union';
        orderMsg = 'Your order will be processed as soon as you update tropicalmeds.com with a Western Union MTCN';
    }
    else {
        paymentMode = 'using the Credit Card ' + order.ccdetails.cardnum;
        orderMsg = 'Your order is now being processed';
    }

    var itemCount       = order.itemCount.formatMoney(0,',','.');
    var totalAmount     = '$'+ order.totalAmount.formatMoney(2,',','.');
    var shippingCharges = '$'+ order.shippingCharges.formatMoney(2,',','.');
    var grandTotal      = '$'+ order.grandTotal.formatMoney(2,',','.');

    var items = [];

    for (i=0; i < order.items.length; i++) {
        unitPrice = '$'+ order.items[i].unitPrice.formatMoney(2,',','.');
        qty       = order.items[i].qty.formatMoney(0,',','.');
        subTotal  = '$'+ order.items[i].subTotal.formatMoney(2,',','.');

        items.push({'manufacturersName':order.items[i].manufacturersName,
                    'genericName':order.items[i].genericName,
                    'packaging':order.items[i].packaging,
                    'qty':qty,
                    'unitPrice':unitPrice,
                    'subTotal':subTotal
        });
    }

    var subject =  'Your order from tropicalmeds.com for ' + itemCount + ' items, totalling ' + grandTotal;

    var pDate = new Date(order.orderDate);
    orderDate = pDate.toDateString();

    var message = {
        name: req.body.name,
        email: order.customerEmail,
        subject: subject,
        paymentMode: paymentMode,
        orderMsg: orderMsg,
        orderDate: orderDate,
        shipTo: order.shipto,
        //countryName: req.body.countryName,
        items: items,
        totalAmount: totalAmount,
        itemCount: itemCount,
        shippingCharges: shippingCharges,
        grandTotal: grandTotal,
        shipment: order.shippingMode,
        supportURL: req.protocol + "://" + req.get('host') + "/support"
    };

    mailer.sendTemplate('confirmorder', message, function(error, response, html, text) {
        if (error) {
           console.log('Unable to send order confirmation email ' + error.message);
        }
        else {
          console.log("Order confirmation email sent for delivery");
        }
    });

    return;

};

var sendMtcnEmail = function(req, order, subject, template) {

    var itemCount       = order.itemCount.formatMoney(0,',','.');
    var totalAmount     = '$'+ order.totalAmount.formatMoney(2,',','.');
    var shippingCharges = '$'+ order.shippingCharges.formatMoney(2,',','.');
    var grandTotal      = '$'+ order.grandTotal.formatMoney(2,',','.');

    var items = [];

    for (i=0; i < order.items.length; i++) {
        unitPrice = '$'+ order.items[i].unitPrice.formatMoney(2,',','.');
        qty       = order.items[i].qty.formatMoney(0,',','.');
        subTotal  = '$'+ order.items[i].subTotal.formatMoney(2,',','.');

        items.push({'manufacturersName':order.items[i].manufacturersName,
                    'genericName':order.items[i].genericName,
                    'packaging':order.items[i].packaging,
                    'qty':qty,
                    'unitPrice':unitPrice,
                    'subTotal':subTotal
        });
    }

    var pDate = new Date(order.orderDate);
    orderDate = pDate.toDateString();

    var message = {
        name: req.body.name,
        email: order.customerEmail,
        paymentRefInfo: order.paymentRef.info,
        subject: subject,
        orderDate: orderDate,
        shipTo: order.shipto,
        items: items,
        totalAmount: totalAmount,
        itemCount: itemCount,
        shippingCharges: shippingCharges,
        grandTotal: grandTotal,
        shipment: order.shippingMode,
        supportURL: req.protocol + "://" + req.get('host') + "/support"
    };

    mailer.sendTemplate(template, message, function(error, response, html, text) {
        if (error) {
           console.log('Unable to send ' + template + ' email ' + error.message);
        }
        else {
          console.log("MTCN " + template + " sent for delivery");
        }
    });

    return;

};

//http://stackoverflow.com/questions/9318674/javascript-number-currency-formatting
Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
    decPlaces2 = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSeparator2 = decSeparator === undefined ? "." : decSeparator,
    thouSeparator2 = thouSeparator === undefined ? "," : thouSeparator,
    sign = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces2)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator2 : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator2) + (decPlaces2 ? decSeparator2 + Math.abs(n - i).toFixed(decPlaces2).slice(2) : "");
};
