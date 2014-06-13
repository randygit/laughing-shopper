
angular.module('mean.roles').controller('ItemShipmentStatusListController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    //console.log('ItemShipmentStatusListController');
    $scope.window = $window;
    $scope.global = Global;

    $scope.order = Basket.popItem();
    //console.log('ItemShipmentStatus' + JSON.stringify($scope.order));

    var pDate = new Date($scope.order.orderDate);
    $scope.orderDate = pDate.toDateString();

    // handle view transaction
    $scope.viewReadiedItems = function(orderId) {
        OrderService.addOrderId(orderId);
        changeLocation('/readiedItems');
    };

    $scope.shippedItems = function(orderId) {
        OrderService.addOrderId(orderId);
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
