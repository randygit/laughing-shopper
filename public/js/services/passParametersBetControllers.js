angular.module('mean.system')
.factory("Basket", function() {

    var items = [];
    var myBasketService = {};

    myBasketService.addItem = function(item) {
        items.push(item);
    };
    myBasketService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    myBasketService.items = function() {
        return items;
    };
    myBasketService.popItem = function() {
        return items.pop();
    };
    myBasketService.clearItems = function() {
        items=[];
    };

    return myBasketService;
})
.factory("ShipToService", function() {

   var items = [];
    var myService = {};

    myService.addItem = function(item) {
        items.push(item);
    };
    myService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    myService.items = function() {
        return items;
    };
    myService.popItem = function() {
        return items.pop();
    };
    myService.clearItems = function() {
        items=[];
    };

    return myService;
})
.factory("ProformaService", function() {

   var items = [];
    var myService = {};

    myService.addItem = function(item) {
        items.push(item);
    };
    myService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    myService.items = function() {
        return items;
    };
    myService.popItem = function() {
        return items.pop();
    };
    myService.clearItems = function() {
        items=[];
    };

    return myService;
})
.factory("CcOwnerService", function() {

   var items = [];
    var myService = {};

    myService.addItem = function(item) {
        items.push(item);
    };
    myService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    myService.items = function() {
        return items;
    };
    myService.popItem = function() {
        return items.pop();
    };
    myService.clearItems = function() {
        items=[];
    };

    return myService;
})
.factory("CcDetailsService", function() {

   var items = [];
    var myService = {};

    myService.addItem = function(item) {
        items.push(item);
    };
    myService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };
    myService.items = function() {
        return items;
    };
    myService.popItem = function() {
        return items.pop();
    };
    myService.clearItems = function() {
        items=[];
    };

    return myService;
})
.service('OrderService', function() {
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
