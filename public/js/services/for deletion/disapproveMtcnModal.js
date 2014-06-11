angular.module('mean.system').factory("DisapproveMtcnModal", ['btfModal', function(btfModal) {
   return btfModal({
        controller: 'DisapproveMtcnController',
        backdrop: true,
        windowClass: 'modal',
        //controllerAs: 'ctrl',
        templateUrl: '/views/wu/partials/disapproveMtcn.html'
    });
}]);
