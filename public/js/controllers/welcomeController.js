angular.module('mean.system').controller('WelcomeController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}]);
