
angular.module('mean.roles').controller('ProductDetailController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'Roles' ,'$routeParams', '$q', 'KartModal', function ($scope, $location, $route, Global, $window, $http, $modal, Roles, $routeParams, $q, KartModal ) {

    $scope.init = function(id) {
        // initialization
        $scope.headers = ["Packaging", "Unit Price ", "Option"];
        $scope.form = {};
        $scope.columnSort = { sortColumn: 'packaging', reverse: false };

        //console.log('Product Detail Controller. Inside init() '+ $routeParams.id);

        $scope.window = $window;
        $scope.global = Global;

        // get product for the given id
        $http.get('/api/product/' + $routeParams.id).
          success(function(data, status, headers, config) {
              //console.log('Product Details of ' + $routeParams.id)
              //console.log(JSON.stringify(data));

              $scope.manufacturersName = data.product.manufacturersName;
              $scope.genericName       = data.product.genericName;

              //console.log('Manus Name   ' + $scope.manufacturersName);
              //console.log('Generic Name ' + $scope.genericName);

              // get products for the same manufacturersName
              $http.get('/api/productdetails/' + $scope.manufacturersName)
                  .success(function(productData, status, headers, config) {
                    //console.log(JSON.stringify(productData));
                    $scope.products = productData;

              });

        });

    };

    $scope.viewCart = function() {
        this.showModal = KartModal.activate();
    };

    $scope.addToCart = function(product) {
          //console.log('Global ' + JSON.stringify(Global));

          var buyBody = {
              email: String,
              productId: String,
              manufacturersName: String,
              packaging: String,
              genericName: String,
              unitPrice: Number,
              qty: Number,
              subTotal: Number
            };

          buyBody.email = Global.user.email;
          buyBody.productId = product._id;
          buyBody.manufacturersName = product.manufacturersName;
          buyBody.genericName = product.genericName;
          buyBody.packaging = product.packaging;
          buyBody.unitPrice = product.unitPrice;
          buyBody.qty = 1;      // default
          buyBody.subTotal = product.unitPrice * buyBody.qty;

          console.log('buyBody ' + JSON.stringify(buyBody));

          if (buyBody) {
            console.log('Adding to cart');


            // will force api/product to redirect
            $http.post('/api/shoppingCart', buyBody).success(function(data) {

                console.log("Success. adding record at /api/shoppingCart");
                $scope.viewCart();
            })
            .error(function(data) {
                  console.log("Error. adding record at /api/shoppingCart");
                  $route.reload();
            });

          }
          else {
            console.log('No data to save');
            $route.reload();
          }
          $route.reload();

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
