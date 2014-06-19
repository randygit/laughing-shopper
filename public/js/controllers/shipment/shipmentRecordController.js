
angular.module('mean.roles').controller('ShipmentRecordController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    $scope.shipment = Basket.popItem();
    $scope.order    = Basket.popItem();


    var pDate = new Date($scope.order.orderDate);
    $scope.orderDate = pDate.toDateString();

    if (angular.equals($scope.order.paymentMode, 'WU')) {
        $scope.payment  = 'Western Union';
    }
    else {
        $scope.payment  = 'Credit/Debit Card';
        if (angular.equals($scope.order.ccdetails.cardtype,'MC')) {
            $scope.cardName = 'MasterCard';
        }
        if (angular.equals($scope.order.ccdetails.cardtype,'VISA')) {
            $scope.cardName = 'VISA';
        }
    }

    $scope.exitShipment = function() {
        Basket.addItem($scope.order);
        changeLocation('/shipmentList');
    };

    $scope.cancelShipment = function(shipment) {
        var cancelDetails = {
            reason: String
        };

        cancelDetails.reason = '';


        var modalInstance = $modal.open({
            templateUrl: '/views/shipment/partials/cancelShipment.html',
            backdrop: true,
            windowClass: 'modal',
            controller: cancelShipmentCtrl,
            resolve: {
                cancelInfo: function() {
                    return cancelDetails;
                }
            }
        });

        modalInstance.result.then(function(cancelInfo) {
            if (cancelInfo) {

                var info = {
                    orderId: String,
                    readiedId: String,
                    qtyCancelled: Number,
                    reason: String,
                    items: [],
                    email: String
                };

                info.orderId      = shipment.orderId;
                info.shippedId    = shipment._id;
                info.qtyCancelled = shipment.qtyShipped;
                info.reason       = cancelInfo.reason;
                info.email        = Global.user.email;
                info.items        = shipment.items;

                //console.log('About to cancelPackingList ' + JSON.stringify(info));
                $http.post('/api/cancelShipment', info).success(function(data) {

                    console.log("Success. cancelling record at /api/cancelShipment");
                    Basket.addItem($scope.order);
                    changeLocation('/shipmentList');

                })
                .error(function(data) {
                    console.log("Success. cancelling record at /api/cancelShipment");
                    Basket.addItem($scope.order);
                    changeLocation('/shipmentList');
                });


            }
            else {
                console.log('No data to delete');
                $route.reload();
            }
        });


    };


    var cancelShipmentCtrl = function($scope, $modalInstance, cancelInfo ) {

        $scope.cancelPackingList = cancelInfo;

        // data is returned through product variable
        $scope.saveChanges  = function () {
            $modalInstance.close(cancelInfo);
        };

        $scope.close  = function() {
            console.log('inside closeDelete)');
            $modalInstance.dismiss('cancel');
        };

    };






    $scope.printPackingList = function() {

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
