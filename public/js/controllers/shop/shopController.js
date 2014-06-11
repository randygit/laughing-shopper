angular.module('mean.system').controller('ShopController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', '$q',  'KartModal',  function ($scope, $location, $route, Global, $window, $http, $modal, $q,  KartModal ) {


    $scope.headers = ["Product Name", "Generic Name", "Packaging", "Unit Price"];
    $scope.form = {};
    console.log('Intializing items for sale...');

    $scope.window = $window;
    $scope.global = Global;



    console.log('getting list of products');

    $http.get('/api/forsale').
      success(function(data, status, headers, config) {
          // console.log(JSON.stringify(data));
          $scope.products = data;
          //console.log('Products for sale ' + JSON.stringify($scope.products));


          // get cart summary. returns an array...
          $http.get('/api/summarizeCart/' + Global.user.email).success(function(data) {
              // api/summarizeCart returns an array since we used select sum()..
              // need to pop out the first record to an object
              // else we have to manipulate the array at the view
              // anyway there is only one record returned

              cartTotals = data.pop();

              console.log('Pop SummarizeCart ' + JSON.stringify(cartTotals));

              if(!cartTotals) {
                  var emptyCart = {
                    itemCount: Number,
                    subTotal: Number
                  };

                  emptyCart.itemCount = 0;
                  emptyCart.subtotal  = 0;

                  cartTotals = emptyCart;
              }


              $scope.summary = cartTotals;
          })
          .error(function(data) {
              console.log("Error. adding record at /api/shoppingCart");
          });
    });

    $scope.buy = function(name) {
        console.log('Inside buy function ' + name);

    };

    $scope.productDetails = function(name) {

        console.log('Inside chkProduct function ' + name);
        $http.get('/api/productdetails/' + name).
          success(function(data, status, headers, config) {
              // console.log(JSON.stringify(data));
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
                //$route.reload();
                // changeLocation('/shop', false);
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
