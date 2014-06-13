
angular.module('mean.roles').controller('OrderShipmentListController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal,  OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;


    email = '*';
    status = 3;

    //$http.get('/api/orderShipment/' + email + '/' + status).
    $http.get('/api/pendingShipment').
      success(function(data, status, headers, config) {
            $scope.orders = data;
    });


    $scope.viewItemShipmentStatusList = function(order) {
        // might have to pass orderID so the itemShipmentStatusList can automatically refresh

        Basket.addItem(order);
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
