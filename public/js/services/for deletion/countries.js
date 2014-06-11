angular.module('mean.system').factory("Countries", ['$http', function($http) { 
    return {
        getData: function() {
            // return $http.get('/data/states.json').then(function(result) {
            return $http.get('/getdata/countries', {cache:true, timeout: 10000}).then(function(result) {
                return result.data;
            });
        }
    };
}]);
