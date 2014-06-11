
angular.module('mean.system').controller('ProductController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', function ($scope, $location, $route, Global, $window, $http, $modal ) {

    // initialization
    $scope.headers = ["Brand Name", "Generic Name", "Packaging", "Unit Price", "Qty on hand", "Sell Flag", "Options"];
    $scope.form = {};
    //$scope.columnSort = { sortColumn: 'Brand Name', reverse: false };

    $scope.window = $window;
    $scope.global = Global;


    $http.get('/api/products').
      success(function(data, status, headers, config) {
          //console.log(JSON.stringify(data));
          $scope.products = data;
    });

    $scope.add = function() {
        console.log('Inside Add function');

        var modalInstance = $modal.open({
            templateUrl: '/views/products/partials/addProduct.html',
            backdrop: true,
            windowClass: 'modal',
            controller: addProductCtrl,
            resolve: {
                product: function() {
                    return $scope.form.add;
                }
            }
        });   // $modal.open

        modalInstance.result.then(function(product) {
            console.log('Result ' + JSON.stringify(product));
            // save data here
            if (product) {
                console.log('Some data to save');


                // will force api/product to redirect
                $http.post('/api/product', product).success(function(data) {

                    console.log("Success. addint record at /api/product");
                    $route.reload();
                })
                .error(function(data) {
                    console.log("Error. adding record at /api/product");
                    $route.reload();
                    //$scope.window.location = '/';
                });

            }
            else {
                console.log('No data to save');
                $route.reload();
            }
        });
    };

    var addProductCtrl = function($scope, $modalInstance, product ) {

        console.log('inside addProductCtrl ');
        // $scope.form.add = product;

        $scope.add = function (product) {
            console.log('inside addProduct()');
            console.log('AddProduct ' + JSON.stringify(product));
            $modalInstance.close(product);
        };

        $scope.close = function() {
            console.log('inside closeProduct()');
            $modalInstance.dismiss('cancel');
            // save data
        };

    };

    $scope.edit = function(id, name) {
        //console.log('Inside Edit function ' + name+ " id " + id);
        // read data first
        $http.get('/api/product/' + id).
            success(function(data, status, headers, config) {
                if (data.status) {
                    //console.log('product' + JSON.stringify(data.product));
                    $scope.product = data.product;

                    var modalInstance = $modal.open({
                        templateUrl: '/views/products/partials/editProduct.html',
                        backdrop: true,
                        windowClass: 'modal',
                        controller: editProductCtrl,
                        resolve: {
                            product: function() {
                                return data.product;
                            }
                        }
                    });   // $modal.open

                    // wait for result and save data

                    modalInstance.result.then(function(product) {
                        console.log('Result ' + JSON.stringify(product));
                        console.log('Key ' + product._id);
                        // save data here
                        if (product) {
                            console.log('Some data to save');

                            // will force api/product to redirect
                            $http.put('/api/product/'+product._id, product).success(function(data) {

                                console.log("Success. updating record at /api/product");
                                $route.reload();
                            })
                            .error(function(data) {
                                console.log("Error. adding record at /api/product");
                                $scope.window.location = '/';
                            });

                        }
                        else {
                            console.log('No data to save');
                            $scope.window.location = '/product';
                        }
                    });

                } else {
                    $scope.window.location('/');
                }
            });

    };



    var editProductCtrl = function($scope, $modalInstance, product ) {

        //console.log('inside editProductCtrl ' + JSON.stringify(product));
        $scope.editProduct = product;

        //console.log('inside $scope.edit ' + JSON.stringify($scope.edit));
        // data is returned through product variable
        $scope.edit = function (product) {
            //console.log('inside editProduct()');
            //console.log('EDitProduct ' + JSON.stringify(product));
            $modalInstance.close(product);
        };

        $scope.close = function() {
            //console.log('inside closeEdit()');
            $modalInstance.dismiss('cancel');
            // save data
        };

    };

    $scope.addPackage = function(id, name) {
        //console.log('Inside addPackage function ' + name+ " id " + id);
        // read data first
        $http.get('/api/product/' + id).
            success(function(data, status, headers, config) {
                if (data.status) {
                    //console.log('product' + JSON.stringify(data.product));
                    $scope.product = data.product;

                    var modalInstance = $modal.open({
                        templateUrl: '/views/products/partials/addPackage.html',
                        backdrop: true,
                        windowClass: 'modal',
                        controller: addPackageCtrl,
                        resolve: {
                            product: function() {
                                return data.product;
                            }
                        }
                    });   // $modal.open

                    // wait for result and save data

                    modalInstance.result.then(function(product) {
                        //console.log('Result ' + JSON.stringify(product));
                        //console.log('Key ' + product._id);
                        // save data here
                        if (product) {
                            console.log('Some data to save');

                            // will force api/product to redirect
                            $http.post('/api/product', product).success(function(data) {

                                //console.log("Success. updating record at /api/product");
                                $route.reload();
                            })
                            .error(function(data) {
                                console.log("Error. adding record at /api/product");
                                $scope.window.location = '/';
                            });

                        }
                        else {
                            console.log('No data to save');
                            $scope.window.location = '/product';
                        }
                    });

                } else {
                    $scope.window.location('/');
                }
            });

    };

    var addPackageCtrl = function($scope, $modalInstance, product ) {

        //console.log('inside addPackageCtrl ' + JSON.stringify(product));
        $scope.addPack  = product ;
        $scope.addPack.packaging = '';
        $scope.addPack.unitPrice = 0;
        $scope.addPack.qtyOnHand = 0;

        $scope.addPackage = function (product) {
            //console.log('inside addPackage()');
            //console.log('AddPackage ' + JSON.stringify(product));
            $modalInstance.close(product);
        };

        $scope.close = function() {
            //console.log('inside closeProduct()');
            $modalInstance.dismiss('cancel');
            // save data
        };

    };

    $scope.delete = function(id, manufacturersName, genericName, packaging) {
        //console.log('Inside delete function ' + " id " + id + " name " + manufacturersName);
        // read data first
        var productDetails = {
            id: String,
            manufacturersName: String,
            genericName: String,
            packaging: String
        };

        productDetails.id                = id;
        productDetails.manufacturersName = manufacturersName;
        productDetails.genericName       = genericName;
        productDetails.packaging         = packaging;

        //console.log('About to open modal delete');

        var modalInstance = $modal.open({
            templateUrl: '/views/products/partials/deleteProduct.html',
            backdrop: true,
            windowClass: 'modal',
            controller: deleteProductCtrl,
            resolve: {
                productInfo: function() {
                    return productDetails;
                }
            }
        });

        modalInstance.result.then(function(productInfo) {
            //console.log('Result ' + JSON.stringify(productInfo));
            //console.log('Key ' + productInfo.id);
            // save data here
            if (productInfo) {
                //console.log('Some data to delete');

                // will force api/product to redirect
                $http.delete('/api/product/'+productInfo.id).success(function(data) {

                    //console.log("Success. deleting record at /api/product");
                    $route.reload();
                })
                .error(function(data) {
                    console.log("Error. deleting record at /api/product");
                    $scope.window.location = '/';
                });

            }
            else {
                console.log('No data to delete');
                $route.reload();
            }
        });


    };


    var deleteProductCtrl = function($scope, $modalInstance, productInfo ) {

        //console.log('inside deleteProductCtrl ' + JSON.stringify(productInfo));
        $scope.deleteProduct = productInfo;

        // data is returned through product variable
        $scope.delete  = function () {
            //console.log('inside deleteProduct()');
            $modalInstance.close(productInfo);
        };

        $scope.close  = function() {
            console.log('inside closeDelete)');
            $modalInstance.dismiss('cancel');
            // save data
        };

    };



}]);
