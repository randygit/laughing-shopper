
angular.module('mean.roles').controller('ShippingRecordController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    $scope.window = $window;
    $scope.global = Global;

    $scope.order = Basket.popItem();
    $scope.shippingRecord = angular.copy($scope.order);
    //console.log('Order' + JSON.stringify($scope.order));

    var pDate = new Date($scope.shippingRecord.orderDate);
    $scope.orderDate = pDate.toDateString();

    var totQty       = 0;
    var totReadied   = 0;
    var totShipped   = 0;
    var totRemaining = 0;
    var totPrevReadied = 0;

    angular.forEach($scope.shippingRecord.items, function(item) {
        item.qtyReadied = 0;
    });

    angular.forEach($scope.order.items, function(item) {
        totQty       += item.qty;
        totShipped   += item.qtyShipped;
        totPrevReadied += item.qtyReadied;
        totRemaining += item.qtyRemaining;

    });

    $scope.totQty       = totQty;
    $scope.totReadied   = totReadied;
    $scope.totShipped   = totShipped;
    $scope.totPrevReadied = totPrevReadied;
    $scope.totRemaining = totRemaining;


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

    $scope.prevReadied = function (productId) {

        retQty = 0;
        angular.forEach($scope.order.items, function(item) {
            if(angular.equals(productId, item.productId)) {
                retQty = item.qtyReadied;
                return retQty;
            }
        });

        return retQty;

    };

    $scope.totalQtyReadied =function() {
        var total = 0;
        angular.forEach($scope.shippingRecord.items, function(item) {
            total += item.qtyReadied;
        });
        return total;
    };


    $scope.totalQtyShipped =function(qtyReadied,qtyRemaining) {
        var total = 0;
        angular.forEach($scope.shippingRecord.items, function(item) {
            total += item.qtyShipped;
        });
        return total;
    };
    // handle view transaction
    $scope.cancel = function(orderId) {
        OrderService.addOrderId(orderId);
        changeLocation('/itemShipmentStatusList');
    };

    $scope.save = function(orderId,shippingRecord) {
        //console.log('Saving shipping Record' + JSON.stringify(shippingRecord));

        var packingList =  {
            "orderId": String,
            "qtyReadied": Number,
            "items": [{
                productId: String,
                manufacturersName: String,
                genericName: String,
                packaging: String,
                qtyReadied: Number,
                qtyShipped: Number
            }],
            "status": Number,       // 0 ok 1- shipped 9 -cancelled
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
        }

        packingList.orderId    = orderId;
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
