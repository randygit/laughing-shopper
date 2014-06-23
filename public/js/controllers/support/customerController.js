
angular.module('mean.roles').controller('CustomerController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, Basket ) {

    // initialization
    $scope.headers = ["Name", "Email", "Deactivated", "Disabled", "Options"];
    $scope.form = {};


    $scope.window = $window;
    $scope.global = Global;



    $http.get('/user/list').
      success(function(data, status, headers, config) {
          $scope.users = data;
    });

    $scope.pendingShipment= function(user) {
        Basket.addItem(user);
        changeLocation('/supportPendingShipment');

    };

    $scope.historicalOrders = function(user) {
        Basket.addItem(user);
        changeLocation('/supportHistoricalOrders');

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
