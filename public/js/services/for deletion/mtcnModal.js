angular.module('mean.system').factory("MtcnModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'MtcnController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/wu/partials/mtcn.html'
    });
}]);
