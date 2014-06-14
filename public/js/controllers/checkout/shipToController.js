
angular.module('mean.system')
    .controller('ShipToController', ['$scope', '$http','$location','$route','$parse', '$window','Global', 'Countries', 'ShipToService', 'ProformaService',
                                       function ($scope, $http, $location, $route, $parse,  $window, Global, Countries, ShipToService, ProformaService ) {


        $scope.getDefault = function() {

            //console.log('Inside ShipToController.getdefault');

            $scope.global = Global;


            Countries.getData().then(function(data) {
                $scope.countryData = data;
                // start
                data = ShipToService.popItem();
                //console.log("Success. back from popItem " + JSON.stringify(data));
                // once an item is pop() its removed from the stack

                if(!data) {
                    var shipto = {
                        fullname: String,
                        address1: String,
                        address2: String,
                        address3: String,
                        city: String,
                        state: String,
                        country: String,
                        zipcode: String
                    };

                    shipto.fullname = Global.user.name;
                    shipto.address1 = Global.user.address1;
                    shipto.address2 = Global.user.address2;
                    shipto.address3 = Global.user.address3;
                    shipto.city     = Global.user.city;
                    shipto.state    = Global.user.state;
                    shipto.country  = Global.user.country;
                    shipto.zipcode  = Global.user.zipcode;

                    $scope.shipto = shipto;
                }else {
                    $scope.shipto = data;
                }


                var proformaData = {
                    paymentMode: String,
                    shippingCharges: Number,
                    shippingMode: String
                };

                data = ProformaService.popItem();
                if(!data) {
                    // get data from mongodb
                    shippingCharges = 17.95;
                    shippingMode = 'Air Mail';

                    // initialize proformData
                    proformaData.paymentMode     = 'WU';
                    proformaData.shippingCharges = shippingCharges;
                    proformaData.shippingMode = shippingMode;


                    // save to scope so we can access it later
                    $scope.shippingCharges = shippingCharges;
                    $scope.proforma = proformaData;

                }
                else {
                    $scope.proforma = data;
                }
                // end



            });


        }; // end of getDefault()

        $scope.toTransaction = function() {
            ProformaService.addItem($scope.proforma);
            ShipToService.addItem($scope.shipto);
            changeLocation('/checkout');

        };

        $scope.toShipTo = function() {
            ProformaService.addItem($scope.proforma);
            ShipToService.addItem($scope.shipto);
            changeLocation('/shipto');

        };

        $scope.toBilling = function() {
            ProformaService.addItem($scope.proforma);
            ShipToService.addItem($scope.shipto);
            changeLocation('/billing');

        };

        $scope.toReview = function() {
            ProformaService.addItem($scope.proforma);
            ShipToService.addItem($scope.shipto);
            changeLocation('/review');

        };

        $scope.saveShipTo = function () {
            //console.log("Saving Ship To " + JSON.stringify($scope.shipto));

            ProformaService.addItem($scope.proforma);
            ShipToService.addItem($scope.shipto);
            changeLocation('/billing');
        };

        $scope.cancelShipTo = function() {
            console.log('Cancel changes ' + Global.user.role);
            if(Global.user.role === 9) {
                // reload shipTo screen
                $route.reload();
            }
            else {
                changeLocation('/shop');
            }
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



    }]);
