
angular.module('mean.roles').controller('PendingShipmentController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'Basket', 'OrderService', function ($scope, $location, $route, Global, $window, $http, $modal, Basket, OrderService ) {

    $scope.window = $window;
    $scope.global = Global;


    $scope.customer = Basket.popItem();
    console.log('$scope.customer' + $scope.customer);

    if(typeof $scope.customer == 'undefined') {
          email = Global.user.email;
    }
    else {
        email = $scope.customer.email;
    }

    // status =3 and qtyRemaining gte 1
    $http.get('/api/customerPendingShipment/' + email).
      success(function(data, status, headers, config) {
            $scope.orders = data;
    });


    $scope.viewItemShipmentStatusList = function(orderId) {
        // might have to pass orderID so the itemShipmentStatusList can automatically refresh

        OrderService.addOrderId(orderId);
        changeLocation('/customerShipmentStatusList');
    };


    $scope.queryCustomerShipmentStatusList = function(orderId) {
        // might have to pass orderID so the itemShipmentStatusList can automatically refresh
        OrderService.addOrderId(orderId);
        changeLocation('/queryCustomerShipmentStatusList');
    };

    // handle view transaction
    $scope.viewOrder = function(orderId) {
        OrderService.addOrderId(orderId);
        changeLocation('/customerOrderDetails');
    };

    $scope.queryCustomerOrderDetails = function(orderId) {
        OrderService.addOrderId(orderId);
        changeLocation('/queryCustomerOrderDetails');
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
