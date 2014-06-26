
angular.module('mean.roles').controller('ItemShipmentStatusListController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket ) {

    //console.log('ItemShipmentStatusListController');
    $scope.window = $window;
    $scope.global = Global;

    $scope.orderId = OrderService.getOrderId();

    $http.get('/api/order/' + $scope.orderId).
      success(function(order, status, headers, config) {
        $scope.order = order;

        var pDate = new Date($scope.order.orderDate);
        $scope.orderDate = pDate.toDateString();

        var totQty       = 0;
        var totReadied   = 0;
        var totShipped   = 0;
        var totRemaining = 0;

        angular.forEach($scope.order.items, function(item) {
            totQty       += item.qty;
            totReadied   += item.qtyReadied;
            totShipped   += item.qtyShipped;
            totRemaining += item.qtyRemaining;
        });
        $scope.totQty       = totQty;
        $scope.totReadied   = totReadied;
        $scope.totShipped   = totShipped;
        $scope.totRemaining = totRemaining;

        $scope.totQty = $scope.order.itemCount;
        $scope.totReadied = $scope.order.qtyReadied;
        $scope.totShipped = $scope.order.qtyShipped;
        $scope.totRemaining = $scope.order.qtyRemaining;

        //$scope.shipMode = 'Air Mail';
        if (angular.equals(order.paymentMode, 'WU')) {
            $scope.payment  = 'Western Union';
        }
        else {
            $scope.payment  = 'Credit/Debit Card';
            if (angular.equals(order.ccdetails.cardtype,'MC')) {
                $scope.cardName = 'MasterCard';
            }
            if (angular.equals(order.ccdetails.cardtype,'VISA')) {
                $scope.cardName = 'VISA';
            }
        }

    });

    // handle view transaction
    $scope.viewReadiedItems = function(order) {
        Basket.addItem(order);
        changeLocation('/packingList');
    };

    $scope.viewShippedItems = function(order) {
        Basket.addItem(order);
        changeLocation('/shipmentList');
    };

     $scope.createShippingRecord = function(order) {
        Basket.addItem(order);
        changeLocation('/shippingRecord');
    };


     $scope.customerPendingShipment = function(order) {
        var customer = {
          email:String
        };

        customer.email = order.customerEmail;

        Basket.addItem(customer);
        changeLocation('/supportPendingShipment');
    };

    // handle view transaction
    $scope.viewCustomerReadiedItems = function(order) {
        Basket.addItem(order);
        changeLocation('/customerPackingList');
    };

    $scope.viewCustomerShippedItems = function(order) {
        Basket.addItem(order);
        changeLocation('/customerShipmentList');
    };

    $scope.queryCustomerShippedItems = function(order) {
        Basket.addItem(order);
        changeLocation('/queryCustomerShipmentList');
    };

    $scope.queryCustomerOrders = function() {
        changeLocation('/queryCustomerOrders');
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
