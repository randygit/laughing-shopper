
angular.module('mean.roles').controller('PackingRecordController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    $scope.packingList = Basket.popItem();
    $scope.order = Basket.popItem();


    var pDate = new Date($scope.order.orderDate);
    $scope.orderDate = pDate.toDateString();

    if (angular.equals($scope.order.paymentMode, 'WU')) {
        $scope.payment  = 'Western Union';
    }
    else {
        $scope.payment  = 'Credit/Debit Card';
        if (angular.equals($scope.order.ccdetails.cardtype,'MC')) {
            $scope.cardName = 'MasterCard';
        }
        if (angular.equals($scope.order.ccdetails.cardtype,'VISA')) {
            $scope.cardName = 'VISA';
        }
    }

    $scope.exitPackingRecord = function() {
        Basket.addItem($scope.order);
        changeLocation('/packingList');
    };

    $scope.cancelPackingRecord = function(packingList) {

        var info = {
            orderId: String,
            readiedId: String,
            qtyCancelled: Number,
            items: [],
            email: String
        };

        info.orderId   = packingList.orderId;
        info.readiedId = packingList._id;
        info.qtyCancelled = packingList.qtyReadied;
        info.email     = Global.user.email;
        info.items     = packingList.items;

        //console.log('About to cancelPackingList ' + JSON.stringify(info));
        $http.post('/api/cancelPackingList', info).success(function(data) {

            console.log("Success. adding record at /api/packingList");
            Basket.addItem($scope.order);
            changeLocation('/packingList');

        })
        .error(function(data) {
            console.log("Error. adding record at /api/packingList");
            Basket.addItem($scope.order);
            changeLocation('/packingList');
        });

    };

    $scope.shipPackingRecord = function() {

    };

    $scope.printPackingRecord = function() {

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
