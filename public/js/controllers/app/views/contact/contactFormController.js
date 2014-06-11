angular.module('mean.system').controller('ContactFormController', ['$scope', '$http','$location', '$window', function ($scope, $http, $location, $window) {

    $scope.init = function( ) {

        console.log("contactFormController.$scope.init");

        $scope.form         = {};
        $scope.message      = '';

        $scope.window = $window;

    };

    $scope.addContact = function () {
        $http.post('/contact/sendemail', $scope.contact)
            .success(function(data) {
                console.log("Success. back from sendmail " + $scope.contact.username);

                url = '/';
                force = false;

                //console.log('URL final ' + url);
                $location.path(url);

                $scope = $scope || angular.element(document).scope();
                if(force || !$scope.$$phase) {
                    //this will kickstart angular if to notice the change
                    $scope.$apply();
                }

                changeLocation('/');
          })
          .error(function(data){
              var lastRoute = $route.current;
              $scope.$on('$locationChangeSuccess', function(event) {
                  console.log('locationChangeSuccess');
                  $route.current = lastRoute;
              });

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
