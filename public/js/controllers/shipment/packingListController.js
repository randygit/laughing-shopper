
angular.module('mean.roles').controller('PackingListController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {


    $scope.window = $window;
    $scope.global = Global;


    // get order record to view the shipto info

    $scope.order = Basket.popItem();

    // required for displaying shipto
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


    $http.get('/api/packingLists/' + $scope.order._id).
      success(function(packingList, status, headers, config) {
        $scope.packingList = packingList;
    });

     $scope.totQtyReadied = function() {
        var total = 0;
        angular.forEach($scope.packingList, function(item) {
            total += item.qtyReadied;
        });
        return total;
    };

    // handle view transaction
    $scope.viewShippingRecord = function(packingList) {
        Basket.addItem($scope.order);
        Basket.addItem(packingList);
        changeLocation('/packingRecord');
    };


    $scope.viewCustomerPackingRecord = function(packingList) {
        Basket.addItem($scope.order);
        Basket.addItem(packingList);
        changeLocation('/customerPackingRecord');
    };



    $scope.cancelShippingRecord = function(packingList) {
    };

    $scope.printShippingRecord = function(packingList) {
    };


    $scope.exitPackingList = function(order) {
        OrderService.addOrderId(order._id);
        changeLocation('/itemShipmentStatusList');
    };


    $scope.exitCustomerPackingList = function(order) {
        OrderService.addOrderId(order._id);
        changeLocation('/customerShipmentStatusList');
    };


    $scope.shipShippingRecord = function(packingList) {

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
