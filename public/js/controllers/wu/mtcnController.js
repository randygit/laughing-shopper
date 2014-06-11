angular.module('mean.system').controller('MtcnController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', '$q', 'MtcnModal',  'OrderService', function ($scope, $location, $route, Global, $window, $http, $modal, $q, MtcnModal, OrderService ) {


      // getdata from service

      $scope.window = $window;
      $scope.global = Global;


      $scope.close = function() {
          console.log('inside closeCart()');
          MtcnModal.deactivate();
      };


      $scope.saveChanges = function() {
          var orderId = OrderService.getOrderId();
          console.log('MTCN entered ' + $scope.mtcn.number + ' for orderID ' + orderId);

          var mtcnInfo = {
              mtcn: String,
              email: String,
              name: String
          };

          mtcnInfo.mtcn = $scope.mtcn.number;
          mtcnInfo.email = Global.user.email;
          mtcnInfo.name   = Global.user.name;

           $http.put('/api/wuOrder/'+orderId, mtcnInfo).success(function(data) {
              console.log("Success. updating record at /api/wuOrder ");
               MtcnModal.deactivate();
              changeLocation('/wu', false);
              $route.reload();

          })
          .error(function(data) {
              console.log("Error. adding record at /api/wuOrder");
          });
          /*
          $scope.update(function(orderId, $scope.mtcn.number, Global.user.email){
              console.log('UPDATE DONE!');
               MtcnModal.deactivate();
              //$modalInstance.dismiss('cancel');
              changeLocation('/wu', false);
              $route.reload();

          });
          */

      };

      /*
      $scope.update = function(orderId, mtcn, email, callback) {

          var promises = [];
          var mtcnInfo = {
              mtcn: String,
              email: String
          };

          mtcnInfo.mtcn = mtcn;
          mtcnInfo.email = email;


          console.log('Updating order ' + JSON.stringify(mtcnInfo));

          // update reference, change status to 1- MTCN entered for verification, 3- ready for shipment
          $http.put('/api/wuOrder/'+orderId, mtcnInfo).success(function(data) {
              console.log("Success. updating record at /api/wuOrder ");
              deferred.resolve(data);
          })
          .error(function(data) {
              console.log("Error. adding record at /api/wuOrder");
              deferred.reject();
          });


          promises.push(deferred.promise);

          $q.all(promises).then(function() {
              callback();
          });
          //deferred.resolve();
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
