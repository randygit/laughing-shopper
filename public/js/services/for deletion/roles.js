angular.module('mean.system').factory("Roles", ['$http', function($http) { 
    return {
        getData: function() { 
            return $http.get('/getdata/roles', {cache:true, timeout: 10000}).then(function(result) {
                return result.data;
            });
        }
    };
}]);
