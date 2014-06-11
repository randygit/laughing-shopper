angular.module('mean.system').service('OrderService', function() {
    var orderList = [];
    var OrderService = {};

    OrderService.addOrderId = function(newObj) {
        //console.log('add Order Id ' + newObj);
        orderList.push(newObj);
    };
    OrderService.getOrderId = function(){
        return orderList.pop();
    };
    
    return OrderService;
});
