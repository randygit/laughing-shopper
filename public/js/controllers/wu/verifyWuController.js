
angular.module('mean.roles').controller('VerifyWuController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', function ($scope, $location, $route, Global, $window, $http, $modal,  OrderService ) {

    // initialization
    //$scope.headers = ["Name", "Email", "Role", "Status", "Option"];
    //$scope.form = {};
    //$scope.columnSort = { sortColumn: 'name', reverse: false };

    //console.log('Intializing...');

    $scope.window = $window;
    $scope.global = Global;


    $http.get('/api/verifyWuOrders').
      success(function(data, status, headers, config) {
          $scope.orders = data;
          //console.log('Scope Order details: ' + JSON.stringify($scope.orders));
    });

    // handle view transaction
    $scope.viewOrder = function(orderId) {

        console.log('order Id to view ' + orderId);
        // pass orderId to service
        OrderService.addOrderId(orderId);

        // changeLocation to ('/order') which has a controller that gets the orderId from a service

        changeLocation('/verifyWu');

    };

    /*
    // handle enter MTCN modal

    $scope.enterMTCN = function() {
        // see KartModal
        this.showModal = MTCNModal.activate();
    };
    */


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
