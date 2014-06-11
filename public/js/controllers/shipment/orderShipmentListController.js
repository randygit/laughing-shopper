
angular.module('mean.roles').controller('OrderShipmentListController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'OrderService', function ($scope, $location, $route, Global, $window, $http, $modal,  OrderService ) {

    $scope.window = $window;
    $scope.global = Global;


    console.log('Initialize in OrderShipmentListController ');

    email = '*';
    status = 3;

    $http.get('/api/orderShipment/' + email + '/' + status).
      success(function(data, status, headers, config) {
            //console.log('orderShipment ' + JSON.stringify(data));
            $scope.orders = data;

    });





     // handle view transaction
    $scope.viewOrder = function(orderId) {

        console.log('order Id to view ' + orderId);
        // pass orderId to service
        OrderService.addOrderId(orderId);

        // changeLocation to ('/order') which has a controller that gets the orderId from a service

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
