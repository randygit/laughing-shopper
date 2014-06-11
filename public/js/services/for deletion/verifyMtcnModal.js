angular.module('mean.system').factory("VerifyMtcnModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'VerifyMtcnController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/wu/partials/verifyMtcn.html'
    });
}]);
