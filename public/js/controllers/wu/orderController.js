
angular.module('mean.roles').controller('OrderController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Basket', 'Countries', 'MtcnModal', 'VerifyMtcnModal','DisapproveMtcnModal', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Basket, Countries, MtcnModal, VerifyMtcnModal, DisapproveMtcnModal ) {

    $scope.window = $window;
    $scope.global = Global;

    var numCountries = 0;



    $scope.cardData = [
      {'code': 'MC', name: 'Mastercard'},
      {'code': 'VISA', name: 'Visa'}
    ];

    // capture order.ID from transaction review
    // use factory
    orderId = OrderService.getOrderId();

    $http.get('/api/order/' + orderId).
      success(function(order, status, headers, config) {
        $scope.order = order;

        //console.log('Order' + JSON.stringify(order));

        // two conditions, no MTCN entered paymentRef does not exist
        // MTCN rejected, paymentRef is null

        if(order.hasOwnProperty('paymentRef')){
            if(!angular.equals(order.paymentRef.info,'')) {
                var pDate = new Date(order.paymentRef.date);
                $scope.paymentDate = pDate.toDateString();
            }

        }

        var orDate = new Date(order.orderDate);
        $scope.orderDate = orDate.toDateString();


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

    $scope.paymentForm = function(paymentMode) {
        if (angular.equals(paymentMode, 'WU')) {
            return 'Western Union';
        }
        else {
            return 'Credit/Debit Card';
        }
    };


    $scope.showWU = function(paymentMode) {
      var retValue = angular.equals(paymentMode, 'WU');
      return !retValue;
    };

    $scope.showCC = function(paymentMode) {
      var retValue = angular.equals(paymentMode, 'CC');
      return !retValue;

    };
    // handle enter MTCN modal

    $scope.enterMtcn = function(orderId) {
        console.log('WU Id to update ' + orderId);
        OrderService.addOrderId(orderId);

        // see KartModal
        this.showModal = MtcnModal.activate();
    };

    $scope.cancelOrder = function(orderId) {
        console.log('Order Id to cancel ' + orderId);
        $http.put('/api/cancelOrder/'+orderId).success(function(data) {
            console.log("Success. cancelling order ");
            changeLocation('/wu', false);

        })
        .error(function(data) {
            console.log("Error. adding record at /api/wuOrder");
        });
    };

    $scope.verifyMtcn = function(orderId) {
        console.log('WU Id to update ' + orderId);
        OrderService.addOrderId(orderId);

        // see KartModal
        this.showModal = VerifyMtcnModal.activate();
    };



    $scope.disapproveMtcn = function(orderId) {
        console.log('WU Id to disapprove ' + orderId);
        OrderService.addOrderId(orderId);

        // see KartModal
        this.showModal = DisapproveMtcnModal.activate();
    };

    $scope.returnCustomerPendingOrders = function(order) {
        var customer = {
          email:String
        };

        customer.email = order.customerEmail;

        Basket.addItem(customer);
        changeLocation('/supportPendingShipment');
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
