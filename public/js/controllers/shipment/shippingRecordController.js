
angular.module('mean.roles').controller('ShippingRecordController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    $scope.order = Basket.popItem();
    $scope.shippingRecord = angular.copy($scope.order);

    var pDate = new Date($scope.shippingRecord.orderDate);
    $scope.orderDate = pDate.toDateString();

    // handle view transaction
    $scope.cancel = function(orderId) {
        OrderService.addOrderId(orderId);
        changeLocation('/itemShipmentStatusList');
    };

    $scope.save = function(orderId,shippingRecord) {
        //console.log('Saving shipping Record' + JSON.stringify(shippingRecord));

        var packingList =  {
            "orderId": Schema.Types.ObjectId,
            "qtyReadied": Number,
            "items": [{
                productId: Schema.Types.ObjectId,
                manufacturersName: String,
                genericName: String,
                packaging: String,
                qtyReadied: Number,
                qtyShipped: Number
            }],
            "status": Number,       // 0 ok 9 -cancelled
            "modifiedBy":   {"info": String, "email": String, "date": Date}
          };

        var modifiedBy = {
            info: String,
            email: String,
            date: Date
        };

        modifiedBy.info = 'Created by';
        modifiedBy.email = Global.user.email;
        modifiedBy.date  = Date.now();


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

        packingList.orderId    = ShippingRecord._id;
        packingList.qtyReadied = totQtyReadied;
        packingList.status     = 0;
        packingList.items      = shippingRecord.items;
        packingList.modifiedBy = modifiedBy;

        $http.post('/api/packingList', packingList).success(function(data) {

            console.log("Success. adding record at /api/packingList");
            OrderService.addOrderId(orderId);
            changeLocation('/itemShipmentStatusList');

        })
        .error(function(data) {
                console.log("Error. adding record at /api/packingList");
                $route.reload();
        });
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
