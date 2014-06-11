

angular.module('mean.system')
    .controller('ResetPasswordFormController', ['$scope', '$http','$location','$route','$parse', '$window','Global',
                                       function ($scope, $http, $location, $route, $parse,  $window, Global ) {

        $scope.getDefault = function() {
            //console.log('Inside ResetFormController.getdefault');

            $scope.global = Global;

            //$scope.window = $window;

        };



        $scope.changePassword = function () {

            var passBody = {
              email: String,
              password: String
            };

            /*
            console.log(" updatePassport");

            console.log('Current password  : ' + ($scope.reset.currentpassword));
            console.log('New Password      : ' + ($scope.reset.newpassword));
            console.log("about to $http.post /validate/password/" + Global.user.email);
            */

            // validation for unique username could also be here


            var passMessage  = $parse('form.' + 'currentpassword' + '.$error.serverMessage');

            var usernameMessage = $parse('form.'+'username'+'.$error.serverMessage');

            // must pass $scope.reset and not individual values else error 500
            //console.log("about to $http.post /validate/password" + Global.user.email);


            passBody.password = $scope.reset.currentpassword;

            $http.post('/validate/password/' + Global.user.email , passBody)
                .success(function(data) {
                    //console.log("Success. back from /validate/password");
                    $scope.form.$setValidity('currentpassword', true, $scope.form);
                    passMessage.assign($scope, '');

                    // save data here
                    $http.post('/user/password/' + Global.user.email, $scope.reset)
                        .success(function(data) {
                            //console.log("Success. back from updating /user/password");
                            //changeLocation('/#!/mobile');
                            //$scope.window.location = '/#!/mobile';
                            if(Global.user.role === 9) {
                                changeLocation('/shop');
                            }
                            else {
                                changeLocation('/welcome');
                            }
                      })
                      // could not reload current page /password
                      // used directive validate-password instead
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
                    // end of save data


                })
                .error(function(data){
                    console.log("Error. back from /validate/password");
                    $scope.form.$setValidity('currentpassword', false, $scope.form);
                    passMessage.assign($scope, 'Current password is not correct!');
                });

            // save
            /*
            $http.post('/user/password/' + Global.user.email, $scope.reset)
                .success(function(data) {
                    console.log("Success. back from /user/profile");
                    $scope.window.location = '/#!/mobile';
              })
              // could not reload current page /password
              // used directive validate-password instead
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
            */



        };  // $scope.updateProfile

        $scope.cancelPassword = function() {
            console.log('Cancel changes');
            changeLocation('/', false);
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

    }])

    .directive('validatePassword', ['$http', 'Global', function($http, Global) {
        return {
          require: 'ngModel',
          link: function(scope, elem, attrs, ctrl) {
            scope.busy = false;
            scope.$watch(attrs.ngModel, function(value) {

              // hide old error messages
              ctrl.$setValidity('isTaken', false);
              ctrl.$setValidity('invalidChars', true);

              if (!value) {
                // don't send undefined to the server during dirty check
                // empty username is caught by required directive
                return;
              }

              console.log('inside uniqueUsername directive ' + value + ' email: ' + Global.user.email);
              scope.busy = true;
              $http.post('/validate/password/' + Global.user.email, {password: value})
                .success(function(data) {
                    console.log('Success. password ' + value + ' is CORRECT');
                    scope.busy = false;
                })
                .error(function(data) {
                    console.log('ERROR. password ' + value + ' is NOT correct');
                    ctrl.$setValidity('isTaken', true);
                    scope.busy = false;
                });
            });
          }
        };
    }]);
