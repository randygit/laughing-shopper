angular.module('mean.system').factory("Global", [function() {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: !! window.user
    };

    return _this._data;
}])
.factory('$logincheck', [ 'Global', function (Global) {
     if(Global.user) return true;
      else return false;
}])
.factory("Roles", ['$http', function($http) {
    return {
        getData: function() {
            return $http.get('/getdata/roles', {cache:true, timeout: 10000}).then(function(result) {
                return result.data;
            });
        }
    };
}])
.factory("Countries", ['$http', function($http) {
    return {
        getData: function() {
            return $http.get('/getdata/countries', {cache:true, timeout: 10000}).then(function(result) {
                return result.data;
            });
        }
    };
}]);
