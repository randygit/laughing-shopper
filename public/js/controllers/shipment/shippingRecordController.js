
angular.module('mean.roles').controller('ShippingRecordController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    $scope.order = Basket.popItem();
    $scope.shippingRecord = angular.copy($scope.order);

    var pDate = new Date($scope.shippingRecord.orderDate);
    $scope.orderDate = pDate.toDateString();

    // handle view transaction
    $scope.cancel = function(order) {
        Basket.addItem(order);
        changeLocation('/itemShipmentStatusList');
    };

    $scope.save = function(order,shippingRecord) {
        //console.log('Saving shipping Record' + JSON.stringify(shippingRecord));

        totQtyReadied = 0;
        for(i=0;i<shippingRecord.items.length; i++) {
            totQtyReadied = totQtyReadied + shippingRecord.items[i].qtyReadied;

            console.log(shippingRecord.items[i].manufacturersName + ' ' +
                        shippingRecord.items[i].qty + ' ' +
                        shippingRecord.items[i].qtyReadied + ' ' +
                        shippingRecord.items[i].qtyShipped + ' ' +
                        shippingRecord.items[i].qtyRemaining + ' '
            );
        }

        console.log('Total Qty Readied ' + totQtyReadied);

        Basket.addItem(order);
        // itemShipmentStatus List most update ites Record..
        changeLocation('/itemShipmentStatusList');
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
