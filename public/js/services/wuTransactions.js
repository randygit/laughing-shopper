
angular.module('mean.system').factory("WuTransactions", ['$http', function($http) {
    return {
        getCount: function(email) {
            return $http.get('/api/getWuCount/' + email).then(function(result) {
                //console.log('getWuCount ' + JSON.stringify(result.data));
                return result.data;
            });
        },
        getData: function(email) {
            return $http.get('/api/getWuTransactions/' + email).then(function(result) {
                //console.log('getWuTransaction ' + JSON.stringify(result.data));
                return result.data;
            });
        }
    };
}]);
