angular.module('mean.system').controller('HeaderController', ['$scope', '$location', 'Global', '$window', 'WuTransactions', function ($scope, $location, Global, $window, WuTransactions) {
    $scope.global = Global;
    //$scope.window = $window;

    // if not logged in Global.user is null
    $scope.menuNotLogged = [
                {
                    "title": "Home",
                    "link": ""
                },
                {
                    "title": "About",
                    "link": "about"
                },
                {
                    "title": "FAQ",
                    "link": "faq"
                },
                {
                    "title": "Terms",
                    "link": "terms"
                }
            ];

    if(Global.user) {

        if(Global.user.role === 0) {
            $scope.menu = [
                {
                    "title": "Shop",
                    "link": "shop"
                },
                {
                    "title": "Products",
                    "link": "products"
                },
                {
                    "title": "Users",
                    "link": "roles"
                },
                {
                    "title": "Verify MTCN",
                    "link": "verify"
                },
                {
                    "title": "Shipping Clerk",
                    "link": "shipment"
                },
                {
                    "title": "Customer Support",
                    "link": "support"
                }


            ];
        }

        if(Global.user.role === 9) {
            $scope.menu = [
                {
                    "title": "Home",
                    "link": "shop"
                },
                {
                    "title": "About",
                    "link": "about"
                },
                {
                    "title": "FAQ",
                    "link": "faq"
                },
                {
                    "title": "Terms",
                    "link": "terms"
                },
                {
                    "title": "Shop",
                    "link": "shop"
                },
                {
                    "title": "Checkout",
                    "link": "checkout"
                },
                {
                    "title": "Western Union",
                    "link": "wu"
                },
                {
                    "title": "Order Status",
                    "link": "queryCustomerOrder"
                }


            ];
        }
    }

    if(Global.user) {
        //console.log('Header Controller ' + Global.user.name + ' ' + Global.user.email);

        if(Global.user.role === 9) {
            url = '/shop';


            var summary = {
                count: Number,
                total: Number
            };

            WuTransactions.getCount(Global.user.email).then(function(data) {
                summary = data;
                 //console.log(' WU transaction ' + JSON.stringify(summary));
                 //console.log(' WU transaction count ' + summary.count);


                  if (summary.count > 0) {
                      url = '/wu';
                      //console.log('URL ' + url);
                  }
                  else {
                      url = '/shop';
                      //console.log('URL ' + url);
                  }
                  force = false;

                  //console.log('URL final ' + url);
                  $location.path(url);

                  $scope = $scope || angular.element(document).scope();
                  if(force || !$scope.$$phase) {
                      //this will kickstart angular if to notice the change
                      $scope.$apply();
                  }
            });


        }
        else {
            url = '/welcome';
            force = false;

            //console.log('URL final ' + url);
            $location.path(url);

            $scope = $scope || angular.element(document).scope();
            if(force || !$scope.$$phase) {
                //this will kickstart angular if to notice the change
                $scope.$apply();
            }
        }
    }
    else {
        //console.log('User is not logged in');
    }

}]);
