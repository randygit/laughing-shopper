angular.module('mean.system').controller('TransactionController', ['$scope', '$location','$route', 'Global', '$window','$http', '$modal',function ($scope, $location, $route, Global, $window, $http, $modal) {


    $scope.window = $window;
    $scope.global = Global;

    /*
    flag = 0
    while(flag == 0) {
        console.log('Waiting for go signal ' + flag);
        flag = Semaphore.getFlag();
    };
    */

    console.log('Checkout.Transaction.. getting list of items in cart');

    $http.get('/api/shoppingCart/' + Global.user.email).
      success(function(data, status, headers, config) {
        //console.log('Checkout items ' + JSON.stringify(data));
        $scope.items = data;
        if(!data[0])
          changeLocation('/shop');
      })
      .error(function(data) {
          console.log("Error. adding record at /api/shoppingCart");
    });

    $scope.subTotal = function(qty, unitPrice) {
        subTotal = qty * unitPrice;
        return subTotal;
    };

    $scope.totalQty =function(items) {
        var total = 0;
        //angular.forEach($scope.items, function(item) {
        angular.forEach(items, function(item) {
            total += item.qty;
        });
        return total;
    };

    $scope.totalAmount = function(items) {
        var total = 0;
        //angular.forEach($scope.items, function(item) {
        angular.forEach(items, function(item) {
            total += (item.qty * item.unitPrice);
        });
        return total;
    };


    $scope.toShipTo = function() {
        changeLocation('/shipto');
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
