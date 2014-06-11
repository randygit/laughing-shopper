angular.module('mean.system').controller('DisapproveMtcnController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', '$q', 'DisapproveMtcnModal',  'OrderService', function ($scope, $location, $route, Global, $window, $http, $modal, $q, DisapproveMtcnModal, OrderService ) {


      // getdata from service

      $scope.window = $window;
      $scope.global = Global;



      $scope.close = function() {
          console.log('inside closeCart()');
          DisapproveMtcnModal.deactivate();
      };


      $scope.saveChanges = function() {
          var orderId = OrderService.getOrderId();
          console.log('MTCN entered ' + $scope.mtcn.number + ' for orderID ' + orderId);

          var mtcnInfo = {
              name: String,
              info: String,
              email: String
          };


          mtcnInfo.info   = $scope.mtcn.info;
          mtcnInfo.email  = Global.user.email;
          mtcnInfo.name   = Global.user.name;

           $http.put('/api/disapproveWuOrder/'+orderId, mtcnInfo).success(function(data) {
              console.log("Success. updating record at /api/wuOrder ");
              // SEND EMAIL HERE, but we dont know the order details... get order
              DisapproveMtcnModal.deactivate();
              changeLocation('/verify', false);
              //$route.reload();

          })
          .error(function(data) {
              console.log("Error. adding record at /api/wuOrder");
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
