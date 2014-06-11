angular.module('mean.system').factory("Global", [function() {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: !! window.user
    };

    return _this._data;
}]);

 
angular.module('mean.system').factory('$logincheck', [ 'Global', function (Global) {
     if(Global.user) return true;
      else return false;
}]);
