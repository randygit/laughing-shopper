
angular.module('mean.roles').controller('HistoricalOrdersController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'Basket',   function ($scope, $location, $route, Global, $window, $http, $modal, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    user = Basket.popItem();

    // status =3 and qtyRemaining gte 1
    $http.get('/api/customerHistoricalOrders/' + user.email).
      success(function(data, status, headers, config) {
            $scope.orders = data;
    });


    $scope.viewItemShipmentStatusList = function(orderId) {
        // might have to pass orderID so the itemShipmentStatusList can automatically refresh

        OrderService.addOrderId(orderId);
        changeLocation('/itemShipmentStatusList');
    };

    // handle view transaction
    $scope.viewOrder = function(orderId) {
        OrderService.addOrderId(orderId);
        changeLocation('/orderDetails');
    };

    $scope.qtyRemaining = function(itemCount,qtyShipped) {
        return itemCount - qtyShipped;
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
