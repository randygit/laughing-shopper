
angular.module('mean.roles').controller('ItemShipmentStatusListController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    //console.log('ItemShipmentStatusListController');
    $scope.window = $window;
    $scope.global = Global;

    orderId = OrderService.getOrderId();

    $http.get('/api/order/' + orderId).
      success(function(order, status, headers, config) {
        $scope.order = order;

        var pDate = new Date($scope.order.orderDate);
        $scope.orderDate = pDate.toDateString();

        var totQty       = 0;
        var totReadied   = 0;
        var totShipped   = 0;
        var totRemaining = 0;

        angular.forEach($scope.order.items, function(item) {
            totQty       += item.qty;
            totReadied   += item.qtyReadied;
            totShipped   += item.qtyShipped;
            totRemaining += item.qtyRemaining;
        });
        $scope.totQty       = totQty;
        $scope.totReadied   = totReadied;
        $scope.totShipped   = totShipped;
        $scope.totRemaining = totRemaining;

    });

    // handle view transaction
    $scope.viewReadiedItems = function(order) {
        // or use Basket
        Basket.addItem(order);
        //OrderService.addOrderId(orderId);
        changeLocation('/readiedItems');
    };

    $scope.shippedItems = function(order) {
        // or use Basket
        Basket.addItem(order);
        //OrderService.addOrderId(orderId);
        changeLocation('/shippedItems');
    };

     $scope.createShippingRecord = function(order) {
        console.log('Create shipping Record');
        Basket.addItem(order);
        changeLocation('/shippingRecord');
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
