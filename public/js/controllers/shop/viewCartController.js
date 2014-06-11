angular.module('mean.system').controller('ViewCartController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', '$q', 'KartModal', function ($scope, $location, $route, Global, $window, $http, $modal, $q, KartModal ) {


      $scope.window = $window;
      $scope.global = Global;

      // initialize. read shopping cart for the given email

      $scope.headers = ["#", "Product Name", "Generic Name", "Packaging", "Unit Price", "Quantity", "Subtotal", "Option"];
      $scope.form = {};
      //$scope.columnSort = { sortColumn: 'Brand Name', reverse: false };
      $scope.index = 0;
      // get data
      $http.get('/api/shoppingCart/' + Global.user.email).
        success(function(data, status, headers, config) {
          //console.log('Shopping Cart items ' + JSON.stringify(data));
          $scope.items = data;
        })
        .error(function(data) {
            console.log("Error. adding record at /api/shoppingCart");
        });


      // end of initialization


      $scope.loadData = function() {
          // get data
          $http.get('/api/shoppingCart/' + Global.user.email).
            success(function(data, status, headers, config) {
              //console.log('Shopping Cart items ' + JSON.stringify(data));
              $scope.items = data;
            })
            .error(function(data) {
                console.log("Error. adding record at /api/shoppingCart");
            });
      };

      $scope.close = function() {
          console.log('inside closeCart()');
          $scope.update(function(){
              console.log('UPDATE DONE!');
              //$modalInstance.dismiss('cancel');
              KartModal.deactivate();
          });
      };


      $scope.saveChanges = function() {
          $scope.update(function(){
              console.log('UPDATE DONE!');
               KartModal.deactivate();
              //$modalInstance.dismiss('cancel');
              changeLocation('/shop', false);
              $route.reload();

          });
      };

      // can you exit to /pay?
      $scope.checkOut = function(totalItems) {
          $scope.update(function(){
              console.log('UPDATE DONE!');
              KartModal.deactivate();
              //$modalInstance.dismiss('cancel');
              changeLocation('/checkout', false);
              //$route.reload();
          });
      };

      $scope.subTotal = function(qty, unitPrice) {
            subTotal = qty * unitPrice;
            return subTotal;
      };

      $scope.totalQty =function() {
          var total = 0;
          angular.forEach($scope.items, function(item) {
              total += item.qty;
          });
          return total;
      };

      $scope.totalAmount = function() {
          var total = 0;
          angular.forEach($scope.items, function(item) {
              total += (item.qty * item.unitPrice);
          });
          return total;
      };


      $scope.update = function(callback) {

          var promises = [];

          console.log('Updating shopping cart');
          angular.forEach($scope.items, function(item) {
              console.log('updating ' + item.genericName);

              var deferred = $q.defer();

              if(item.qty === 0) {
                  $http.delete('/api/shoppingCart/'+item._id).success(function(data) {
                      console.log("Success. deleting record at /api/shoppingCart " + item.genericName);
                      deferred.resolve(data);
                  })
                  .error(function(data) {
                      console.log("Error. deleting record at /api/shoppingCart");
                      deferred.reject();
                  });

              }
              else {
                  item.subTotal = item.qty * item.unitPrice;
                  $http.put('/api/shoppingCart/'+item._id, item).success(function(data) {
                      console.log("Success. updating record at /api/shoppingCart " + item.genericName);
                      deferred.resolve(data);
                  })
                  .error(function(data) {
                      console.log("Error. adding record at /api/shoppingCart");
                      deferred.reject();
                  });

              } // end if

              promises.push(deferred.promise);


          });

          $q.all(promises).then(function() {
              callback();
          });
          //deferred.resolve();
      };



      $scope.delete = function(id, manufacturersName, genericName, packaging) {
          // read data first
          var itemDetails = {
              id: String,
              manufacturersName: String,
              genericName: String,
              packaging: String
          };

          itemDetails.id                = id;
          itemDetails.manufacturersName = manufacturersName;
          itemDetails.genericName       = genericName;
          itemDetails.packaging         = packaging;

          console.log('About to open modal delete for ' + JSON.stringify(itemDetails));

          var modalInstance = $modal.open({
              templateUrl: '/views/shop/partials/deleteItem.html',
              backdrop: true,
              windowClass: 'modal',
              controller: deleteItemCtrl,
              resolve: {
                  itemInfo: function() {
                      return itemDetails;
                  }
              }
          });

          modalInstance.result.then(function(itemInfo) {
              console.log('Result ' + JSON.stringify(itemInfo));
              console.log('Key ' + itemInfo.id);
              // save data here
              if (itemInfo) {
                  console.log('Some data to delete');

                  // will force api/product to redirect
                  $http.delete('/api/shoppingCart/'+itemInfo.id).success(function(data) {

                      console.log("Success. deleting record at /api/shoppingCart");
                      //$route.reload loads /shop but not the modal
                      $route.reload();
                      $scope.loadData();
                  })
                  .error(function(data) {
                      console.log("Error. deleting record at /api/shoppingCart");
                      //$route.reload();
                      $scope.loadData();
                  });

              }
              else {
                  console.log('No data to delete');
                  //$route.reload();
                  $scope.loadData();
              }
          });


      };


      var deleteItemCtrl = function($scope, $modalInstance, itemInfo ) {

          console.log('inside deleteItemCtrl ' + JSON.stringify(itemInfo));
          $scope.deleteItem = itemInfo;

          // data is returned through product variable
          $scope.delete  = function () {
              console.log('inside deleteProduct()');
              $modalInstance.close(itemInfo);
          };

          $scope.close  = function() {
              console.log('inside closeDelete)');
              $modalInstance.dismiss('cancel');
              // save data
          };

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
