// for /app/views/user/reset.jade
angular.module('mean.system')
    .controller('ForgotPasswordFormController', ['$scope', '$http','$location', '$window',
                 function ($scope, $http, $location, $window  ) {

    // init actually works. just like the init of java functions
    // but using real values not variables in the calling view

    // passed parameters are from reset.jade
    $scope.init = function(email, confirmNewUserURL) {
        console.log("$scope.init ForgotPasswordFormController");
        console.log('Email ' + email);
        //console.log('URL   ' + confirmNewUserURL);

        $scope.email = email;
        //$scope.confirmNewUserURL = confirmNewUserURL;

        console.log('$scope.email             ' + $scope.email);
        //console.log('$scope.confirmNewUserURL ' + $scope.confirmNewUserURL);

        // initialize $scope.contact
        $scope.form         = {};
        $scope.message      = '';

        $scope.window = $window;
    };



    // how to pass variable from view but not part of the form

    $scope.forgotPassword = function () {


      console.log("ForgotPasswordFormController");
      console.log("Email   : " + $scope.email);
      console.log("Password: " + $scope.forgot.password);
      console.log("Verify  : " + $scope.forgot.verification);
      //console.log('URL     : ' + $scope.confirmNewUserURL);

      //console.log("User name: " + $scope.user.username + " " + $scope.user.email);

      // must pass $scope.reset and not individual values else error 500
      console.log("about to $http.post /verify/password");

      $http.post('/verify/password/' + $scope.email, $scope.forgot)
        .success(function(data) {
          console.log("Success. back from /verify/password");


          $scope.window.location = '/login';



        })
        .error(function(data){
          console.log("error in sending email");


          $scope.window.location = '/#!';

      });

    };  // $scope.forgotPassword

 }]);
