
angular.module('mean.roles').controller('PackingRecordController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    $scope.packingList = Basket.popItem();
    $scope.order = Basket.popItem();


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

    $scope.exitPackingList = function() {
        Basket.addItem($scope.order);
        changeLocation('/packingList');
    };

    $scope.cancelPackingList = function(packingList) {
        var cancelDetails = {
            reason: String
        };

        cancelDetails.reason = '';


        var modalInstance = $modal.open({
            templateUrl: '/views/shipment/partials/cancelPackingList.html',
            backdrop: true,
            windowClass: 'modal',
            controller: cancelPackingListCtrl,
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

                info.orderId   = packingList.orderId;
                info.readiedId = packingList._id;
                info.qtyCancelled = packingList.qtyReadied;
                info.reason    = cancelInfo.reason;
                info.email     = Global.user.email;
                info.items     = packingList.items;

                //console.log('About to cancelPackingList ' + JSON.stringify(info));
                $http.post('/api/cancelPackingList', info).success(function(data) {

                    console.log("Success. adding record at /api/packingList");
                    Basket.addItem($scope.order);
                    changeLocation('/packingList');

                })
                .error(function(data) {
                    console.log("Error. adding record at /api/packingList");
                    Basket.addItem($scope.order);
                    changeLocation('/packingList');
                });


            }
            else {
                console.log('No data to delete');
                $route.reload();
            }
        });


    };


    var cancelPackingListCtrl = function($scope, $modalInstance, cancelInfo ) {

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

    $scope.shipPackingList = function(packingList) {
        var shippingDetails = {
            details: String,
            when: String,
            by: String
        };

        shippingDetails.details = '';
        shippingDetails.when    = '';
        shippingDetails.by      = '';

        var modalInstance = $modal.open({
            templateUrl: '/views/shipment/partials/shipPackingList.html',
            backdrop: true,
            windowClass: 'modal',
            controller: shipPackingListCtrl,
            resolve: {
                shipInfo: function() {
                    return shippingDetails;
                }
            }
        });

        modalInstance.result.then(function(shipInfo) {
            if (shipInfo) {
                console.log('shipping info ' + JSON.stringify(shipInfo ));
            }

        });


    };


    var shipPackingListCtrl = function($scope, $modalInstance, shipInfo ) {

        $scope.shipPackingList = shipInfo;

        // data is returned through ship info
        $scope.saveChanges  = function () {
            $modalInstance.close(shipInfo);
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
