
angular.module('mean.system')
    .controller('ProfileFormController', ['$scope', '$http','$location','$route','$parse', '$window','Global', 'Countries', 'Basket',
                                       function ($scope, $http, $location, $route, $parse,  $window, Global, Countries, Basket ) {


        $scope.getDefault = function() {


            // this works using $http('/getData/countries')
            // use a factory called Countries to get data from $http
            Countries.getData().then(function(data) {
                $scope.countryData = data;
                  // initialize values from mongo
                  $http.get('/user/profile/' + Global.user.email,{timeout:10000})
                        .success(function(profile) {
                            $scope.profile  = profile;

                            // profile also changes, have to copy to another object
                            origData = angular.copy(profile);
                            //Basket.clearItems();
                            Basket.addItem(origData);

                      })
                      .error(function(data){
                          console.log("error in getting profile");
                          changeLocation('/', false);
                  });
            });



            $scope.global = Global;
        };

        $scope.updateProfile = function () {


            origData = Basket.popItem();
            //Basket.clearItems();

            //console.log('updated  profile ' + JSON.stringify($scope.profile));

            if(angular.equals(origData, $scope.profile)) {
                if(Global.user.role === 9) {
                    changeLocation('/shop');
                }
                else {
                    changeLocation('/welcome');
                }

            }
            else {
                //console.log('Changes in profile. angular style. saving Data');
                // must pass $scope.profile and not individual values else error 500
                //console.log("about to $http.post /user/profile");

                $http.post('/user/profile/' + Global.user.email, $scope.profile)
                    .success(function(data) {
                        //console.log("Success. back from /user/profile " + JSON.stringify($scope.profile));
                        // Global = $scope.profile;
                        Global.user.name     = $scope.profile.name;
                        Global.user.address1 = $scope.profile.address1;
                        Global.user.address2 = $scope.profile.address2;
                        Global.user.address3 = $scope.profile.address3;
                        Global.user.city     = $scope.profile.city;
                        Global.user.state    = $scope.profile.state;
                        Global.user.country  = $scope.profile.country;
                        Global.user.zipcode  = $scope.profile.zipcode;
                        if(Global.user.role === 9) {
                            changeLocation('/shop');
                        }
                        else {
                            changeLocation('/welcome');
                        }
                  })
                  .error(function(data){

                      console.log("error in saving profile");
                      //$scope.window.location = '/#!/password';
                      //$route.reload();

                      var lastRoute = $route.current;
                      $scope.$on('$locationChangeSuccess', function(event) {
                          console.log('locationChangeSuccess');
                          $route.current = lastRoute;
                      });



                });
            }


        };  // $scope.updateProfile

        $scope.cancelProfile = function() {
            console.log('Cancel changes');
            if(Global.user.role === 9) {
                changeLocation('/shop');
            }
            else {
                changeLocation('/welcome');
            }
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
