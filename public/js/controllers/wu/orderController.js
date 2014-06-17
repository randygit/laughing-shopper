
angular.module('mean.roles').controller('OrderController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal',  'OrderService', 'Countries', 'MtcnModal', 'VerifyMtcnModal','DisapproveMtcnModal', function ($scope, $location, $route, Global, $window, $http, $modal, OrderService, Countries, MtcnModal, VerifyMtcnModal, DisapproveMtcnModal ) {

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

    /*
    $scope.thousandsQty = function(qty) {
        var formatQty = 0;

        formatQty = qty;
        retQty = formatQty.formatMoney(0,',','.');
        return retQty;
    };

    var testObject = function(obj, prop) {
        var parts = prop.split('.');
            for(var i = 0, l = parts.length; i < l; i++) {
                var part = parts[i];
                if(obj !== null && typeof obj === "object" && part in obj) {
                    obj = obj[part];
                }
                else {
                    return false;
                }
            }
        return true;
    };

    //http://stackoverflow.com/questions/9318674/javascript-number-currency-formatting
    Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
        var n = this,
        decPlaces2 = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator2 = decSeparator === undefined ? "." : decSeparator,
        thouSeparator2 = thouSeparator === undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces2)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
        return sign + (j ? i.substr(0, j) + thouSeparator2 : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator2) + (decPlaces2 ? decSeparator2 + Math.abs(n - i).toFixed(decPlaces2).slice(2) : "");
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
    */

}]);
