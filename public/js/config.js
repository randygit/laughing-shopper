//Setting up route
// added check to prevent users from accessing unauthorized areas

window.app.config(['$routeProvider',
    function($routeProvider, $locationProvider) {

        // console.log('routeProvider');

        $routeProvider.
        when('/contact', {
            templateUrl: 'views/contacts/list.html'
        }).
        when('/about', {
            templateUrl: 'views/about/about.html'
        }).
        when('/faq', {
            templateUrl: 'views/about/faq.html'
        }).
        when('/terms', {
            templateUrl: 'views/about/terms.html'
        }).
        when('/profile', {
            templateUrl: 'views/profile/profile.html'
        }).
        when('/password', {
            templateUrl: 'views/profile/password.html'
        }).
        when('/roles', {
            templateUrl: 'views/roles/list.html'
        }).
        when('/products', {
            templateUrl: 'views/products/list.html'
        }).
        when('/productDetails/:id', {
            templateUrl: 'views/shop/partials/details.html'
        }).
        when('/shop', {
            templateUrl: 'views/shop/list.html'
        }).
        when('/checkout', {
            templateUrl: 'views/checkout/transaction.html'
        }).
        when('/shipto', {
            templateUrl: 'views/checkout/shipto.html'
        }).
        when('/billing', {
            templateUrl: 'views/checkout/billing.html'
        }).
        when('/review', {
            templateUrl: 'views/checkout/review.html'
        }).
        when('/welcome', {
            templateUrl: 'views/welcome.html'
        }).
        when('/wu', {
            templateUrl: 'views/wu/transaction.html'
        }).
        when('/order', {
            templateUrl: 'views/wu/order.html'
        }).
        when('/verify', {
            templateUrl: 'views/wu/verify.html'
        }).
        when('/verifyWu', {
            templateUrl: 'views/wu/verifyWu.html'
        }).
        when('/shipment', {
            templateUrl: 'views/shipment/orderShipmentList.html'
        }).
        when('/orderDetails', {
            templateUrl: 'views/shipment/orderDetails.html'
        }).
        when('/itemShipmentStatusList', {
            templateUrl: 'views/shipment/itemShipmentStatusList.html'
        }).
        when('/shippingRecord', {
            templateUrl: 'views/shipment/shippingRecord.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]).run(function($logincheck,$rootScope, $location) {
    // $logincheck is init in js/services/global.js
    // makes sure that the user who is not logged in is not allowed into certain areas

    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        //console.log("$rootScope.$on and loginCheck: " + $logincheck);
        if($logincheck === false) {
            $location.path('/');
        }
    });
});

// code above is from jigal patel and st. never
// but does not redirect sometimes

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);

/*
//get rid of the #
window.app.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});
*/
