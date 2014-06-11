angular.module('mean.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    // $rootScope.loggedUser = Global.user.name;

    console.log('IndexController');

    if(Global.user) {
      console.log('User is logged in');
    }
    else {
      console.log('User is not logged in');
    }
}]);
