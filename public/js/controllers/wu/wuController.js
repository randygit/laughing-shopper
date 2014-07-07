
angular.module('mean.roles').controller('WuController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'WuTransactions', 'OrderService', function ($scope, $location, $route, Global, $window, $http, $modal, WuTransactions, OrderService ) {

    // initialization
    //$scope.headers = ["Name", "Email", "Role", "Status", "Option"];
    //$scope.form = {};
    //$scope.columnSort = { sortColumn: 'name', reverse: false };

    //console.log('Intializing...');

    $scope.window = $window;
    $scope.global = Global;

    // use a factory called Countries to get data from $http
    WuTransactions.getData(Global.user.email).then(function(data) {
        //console.log(' Order ' + JSON.stringify(data));
        $scope.orders = data;
    });

    // handle view transaction
    $scope.viewOrder = function(orderId) {

        console.log('order Id to view ' + orderId);
        // pass orderId to service
        OrderService.addOrderId(orderId);

        // changeLocation to ('/order') which has a controller that gets the orderId from a service

        changeLocation('/order');

    };


    // handle view transaction
    $scope.cancelOrder = function(orderId) {

        console.log('order Id to cancel ' + orderId);
        // pass orderId to service
        OrderService.addOrderId(orderId);

        // changeLocation to ('/order') which has a controller that gets the orderId from a service

        changeLocation('/cancelOrder');

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
