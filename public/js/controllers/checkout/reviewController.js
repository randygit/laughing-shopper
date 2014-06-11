
angular.module('mean.system')
    .controller('ReviewController', ['$scope', '$http','$location','$route','$parse', '$window','Global', 'Countries', 'ShipToService', 'ProformaService', 'CcOwnerService', 'CcDetailsService', function ($scope, $http, $location, $route, $parse,  $window, Global, Countries, ShipToService, ProformaService, CcOwnerService, CcDetailsService) {

        //var mailer = require('../../../config/mailer');

        $scope.window = $window;
        $scope.global = Global;



        $scope.cardData = [
          {'code': 'MC', name: 'Mastercard'},
          {'code': 'VISA', name: 'Visa'}
        ];


        $http.get('/api/shoppingCart/' + Global.user.email).
            success(function(data, status, headers, config) {
                // console.log('Shopping Cart items ' + JSON.stringify(data));
                $scope.items = data;

                Countries.getData().then(function(countries) {
                    $scope.countryData = countries;
                    // start
                    data = ShipToService.popItem();
                    //console.log("Success. back from shipTo.popItem " + JSON.stringify(data));

                    if(!data) {
                        console.log("Do not Proceed");
                        //changeLocation('/shipto');
                    }
                    else {
                        $scope.shipto = data;

                        $scope.shiptoCountry = getCountryName(countries,$scope.shipto.country);
                    }


                    data = ProformaService.popItem();

                    if(!data) {
                        console.log("Do not Proceed");

                    }
                    else {
                        $scope.proforma = data;
                    }


                    data = CcOwnerService.popItem();
                    if(!data) {
                        console.log("Do not Proceed");
                    }else {
                        $scope.ccowner = data;
                        $scope.ccCountry =  getCountryName(countries,$scope.ccowner.country);
                    }

                    data = CcDetailsService.popItem();
                    if(!data) {
                        console.log("Do not Proceed");
                    }else {
                        $scope.ccdetails = data;
                    }
                    // end

                });

          })
          .error(function(data) {
              console.log("Error. adding record at /api/shoppingCart");
        });


        $scope.subTotal = function(qty, unitPrice) {
            subTotal = qty * unitPrice;
            return subTotal;
        };

        $scope.totalQty = function(items) {
            var total = 0;
            //angular.forEach($scope.items, function(item) {
            angular.forEach(items, function(item) {
                total += item.qty;
            });
            return total;
        };

        $scope.totalAmount = function(items) {
            var total = 0;
            //angular.forEach($scope.items, function(item) {
            angular.forEach(items, function(item) {
                total += (item.qty * item.unitPrice);
            });
            return total;
        };

        $scope.grandTotal = function(totalAmount,shippingCharges) {
            grandTot =  totalAmount + shippingCharges;
            return grandTot;
        };

        $scope.paymentMode = function(paymentMode) {
            if (angular.equals(paymentMode, 'WU')) {
                return 'Western Union';
            }
            else {
                return 'Credit/Debit Card';
            }
        };

        $scope.showCC = function(paymentMode) {
            var retValue = angular.equals(paymentMode, 'CC');
            return !retValue;
        };




        $scope.toTransaction = function() {
            ShipToService.addItem($scope.shipto);
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/checkout');

        };

        $scope.toShipTo = function() {
            ShipToService.addItem($scope.shipto);
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/shipto');

        };

        $scope.toBilling = function() {
            ShipToService.addItem($scope.shipto);
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/billing');

        };

        $scope.toReview = function() {
            ShipToService.addItem($scope.shipto);
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/review');

        };


        $scope.completePurchase = function() {
            // if credit card, go to gateway
            // save into invoice and clear cart
            saveOrderAndClearCart();

            // clear shopping cart
            //clearCart(Global.user.email);

            // clear all services
            ShipToService.clearItems() ;
            ProformaService.clearItems();
            CcOwnerService.clearItems();
            CcDetailsService.clearItems();
            changeLocation('/shop');

        };

       var getCountryName = function(countries,countryCode) {

          var countryName = '';

          for (i=0;i<countries.length;i++) {
              //console.log('Country ' + countries[i].code + ' ' + countries[i].name);

              if(angular.equals(countries[i].code, countryCode)) {
                  countryName = countries[i].name;
                  break;
              }
          }

          return countryName;

      };

        var saveOrderAndClearCart = function() {
            // will force api/product to redirect
            var order = {
                    "name": String,
                    "orderDate": Date,
                    "orderRef":String,
                    "customerEmail":String,
                    "shipto" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                                "city": String, "state": String, "country": String, "zipcode": String},
                    "countryName": String,
                    "paymentMode": String,
                    "itemCount": Number,
                    "totalAmount": Number,
                    "shippingCharges": Number,
                    "grandTotal": Number,
                    "ccdetails": {"cardtype": String, "cardnum": String, "expirymonth": String,
                                  "expiryyear": String, "cardcvv": String},
                    "ccowner" : {"fullname": String, "address1": String, "address2": String,"address3":String,
                                "city": String, "state": String, "country": String, "zipcode": String},
                    "items": [{
                              //email: String,
                              productId: String,
                              manufacturersName: String,
                              genericName: String,
                              packaging: String,
                              unitPrice: Number,
                              qty: Number,
                              subTotal: Number
                              }],
                     "status":Number,
                     "paymentRef":  {"info": String, "email": String, "date": Date},
                     "verifiedBy":  {"info": String, "email": String, "date": Date},
                     "cancelledBy": {"info": String, "email": String, "date": Date},
                     "log":[{email:String, comment: String, date: Date}],
                     "shipment": [{
                                "shipmentDate": Date,
                                "shippedBy": String,
                                "shipmentRef": String,
                                "items": [{
                                    productId: String,
                                    manufacturersName: String,
                                    genericName: String,
                                    packaging: String,
                                    qty: Number
                                    }]
                              }]
            };

            order.name = Global.user.name;
            order.orderDate = Date.now();
            order.orderRef  = "INV001";
            order.customerEmail = Global.user.email;
            order.shipto = $scope.shipto;
            order.paymentMode = $scope.proforma.paymentMode;
            order.totalAmount = $scope.totalAmount($scope.items);
            order.itemCount = $scope.totalQty($scope.items);
            order.shippingCharges = $scope.proforma.shippingCharges;
            order.grandTotal = order.totalAmount + order.shippingCharges;
            order.ccdetails = $scope.ccdetails;
            order.ccdetails = secureCCInfo(order.ccdetails);
            order.ccowner   = $scope.ccowner;
            order.items     = $scope.items;   //items.email is redundant

            //order.country = $scope.country;

            // save countryName to order instead of countryCode for less bandwidth req
            order.shipto.country  = $scope.shiptoCountry;
            order.ccowner.country = $scope.ccCountry;

            order.log = [];
            order.log.push({email:Global.user.email, comment: 'Order booked', date: Date.now()});

            // if payment is thru WU, the paymentRef will be updated later
            // if payment is thru CC, information from CC payment gateway will be added here

            var paymentRef = {
                info: String,
                date: Date,
                email:String
            };

           if (angular.equals($scope.proforma.paymentMode, 'WU')) {
                order.status     = 0;
                paymentRef.info  = '';
                paymentRef.email = '';
                paymentRef.date  = '';

            }
            else {
                order.status    = 3;
                paymentRef.info  = 'Paypal Ref. #666';
                paymentRef.email = '';
                paymentRef.date  =  '';
            }

            // order.status     = 0;        // assume cc gateway signals ok
            order.paymentRef = paymentRef;

            $http.post('/api/order', order).success(function(data) {

                console.log("Success. adding record at /api/shoppingCart");
                changeLocation('/shop', false);

                $http.put('/api/clearCart/'+Global.user.email).success(function(data) {

                    console.log("Success. deleting record at /api/shoppingCart");
                })
                .error(function(data) {
                    console.log("Error. deleting record at /api/shoppingCart");
                });
            })
            .error(function(data) {
                  console.log("Error. adding record at /api/shoppingCart");
                  $route.reload();
            });
        };


        secureCCInfo = function(ccData) {

            ccData.cardnum = hideCCInfo(ccData.cardnum);
            ccData.cardcvv = '';
            ccData.expirymonth = '';
            ccData.expiryyear  = '';
            //console.log('ccDetails secured ' + JSON.stringify(ccData));
            return ccData;
        };


        var hideCCInfo = function(cardnum) {
            //console.log('CC Num ' +  cardnum );
            //console.log('CC Num length ' + cardnum.length);
            j = cardnum.length - 5;
            while (j >= 0) {
                c = cardnum.charAt(j);
                //console.log('Index ' + j + ' Character ' + c);
                if (c == ' ' || c == '-') {
                  //console.log('\tDo nothing with ' + c);
                  i = 1;
                }
                else {
                   //console.log('\tReplace with X ');
                   cardnum = setCharAt(cardnum,j,'X');
                }
                j--;
            }
            //console.log('Hide Num ' + cardnum);
            return cardnum;
        };

        var setCharAt = function(str,index,chr) {
            if(index > str.length-1) return str;
            return str.substr(0,index) + chr + str.substr(index+1);
        };

         // from http://www.yearofmoo.com/2012/10/more-angularjs-magic-to-supercharge-your-webapp.html#apply-digest-and-phase
        var changeLocation = function(url, force) {
            //this will mark the URL change
            $location.path(url); //use $location.path(url).replace() if you want to replace the location instead

            $scope = $scope || angular.element(document).scope();
            if(force || !$scope.$$phase) {
                //this will kickstart angular if to notice the change
                $scope.$apply();
            }
        };

        /*
        var sendEmail = function(name, order) {

            var paymentMode ='';
            var orderMsg = '';

            if (angular.equals(order.paymentMode, 'WU')) {
                paymentMode = 'thru Western Union';
                orderMsg = 'Your order will be processed as soon as you update tropicalmeds.com with a Western Union MTCN';
            }
            else {
                paymentMode = 'using Credit Card ' + order.cdetails.cardnum;
                orderMsg = 'Your order is now being processed';
            }


            var message = {
                name: name,
                email: order.customerEmail,
                subject: 'Your Order',
                paymentMode: paymentMode,
                orderMsg: orderMsg,
                shipTo: order.shipTo,
                items: order.items,
                totalAmount: order.totalAmount,
                itemCount: order.itemCount,
                shippingCharges: order.shippingCharges,
                grandTotal: order.grandTotal,
                shipment: 'using Air Mail'
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
      */

}]);
