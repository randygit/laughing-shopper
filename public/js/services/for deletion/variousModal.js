angular.module('mean.system')
.factory("KartModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'ViewCartController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/shop/partials/viewCart.html'
    });
}])
.factory("MtcnModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'MtcnController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/wu/partials/mtcn.html'
    });
}])
.factory("VerifyMtcnModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'VerifyMtcnController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/wu/partials/verifyMtcn.html'
    });
}])
.factory("DisapproveMtcnModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'DisapproveMtcnController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/wu/partials/disapproveMtcn.html'
    });
}])
.factory("WuTransactions", ['$http', function($http) {
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
