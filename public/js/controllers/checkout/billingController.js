
angular.module('mean.system')
    .controller('BillingController', ['$scope', '$http','$location','$route','$parse', '$window','Global', 'Countries', 'ProformaService', 'CcOwnerService', 'CcDetailsService', function ($scope, $http, $location, $route, $parse,  $window, Global, Countries, ProformaService, CcOwnerService, CcDetailsService) {


        $scope.global = Global;





        $scope.payForm = [
          {'code': 'WU', name: 'Western Union'},
          {'code': 'CC', name: 'Credit/Debit Card'}
        ];

        $scope.cardData = [
          {'code': 'MC', name: 'Mastercard'},
          {'code': 'VISA', name: 'Visa'}
        ];

        $scope.monthData = [
          {'code': '01', name: 'Jan (01)'},
          {'code': '02', name: 'Feb (02)'},
          {'code': '03', name: 'Mar (03)'},
          {'code': '04', name: 'Apr (04)'},
          {'code': '05', name: 'May (05)'},
          {'code': '06', name: 'Jun (06)'},
          {'code': '07', name: 'Jul(07)'},
          {'code': '08', name: 'Aug (08)'},
          {'code': '09', name: 'Sep (09)'},
          {'code': '10', name: 'Oct(10)'},
          {'code': '11', name: 'Nov (11)'},
          {'code': '12', name: 'Dec (12)'}
        ];

        $scope.yearData = [
          {'code': '14', name: '2014'},
          {'code': '15', name: '2015'},
          {'code': '16', name: '2016'},
          {'code': '17', name: '2017'},
          {'code': '18', name: '2018'},
          {'code': '19', name: '2019'},
          {'code': '20', name: '2020'},
          {'code': '21', name: '2021'},
          {'code': '22', name: '2022'},
          {'code': '23', name: '2023'},
          {'code': '24', name: '2024'}

        ];



        // get totals from shopping cart
        // get cart summary. returns an array...
        //console.log('Global ' + JSON.stringify(Global));

        $http.get('/api/summarizeCart/' + Global.user.email).success(function(data) {

            // data is in array, need to pop
            cartTotals = data.pop();

            Countries.getData().then(function(data) {
                $scope.countryData = data;

                data = ProformaService.popItem();

                if(!data) {
                    console.log("No data. Cant continue ");

                    var proformaData = {
                        paymentMode: String,
                        shippingCharges: Number
                    };

                    proformaData.paymentMode = 'WU';
                    proformaData.shippingCharges = 17.95;

                    $scope.proforma = proformaData;

                }
                else {
                    $scope.proforma = data;
                }

                //console.log('Proforma ' + JSON.stringify($scope.proforma));

                $scope.totalAmount = cartTotals.subtotal + $scope.proforma.shippingCharges;

                // get info from billingService
                // else get data from database;

                data = CcOwnerService.popItem();
                //console.log("Success. back from ccOwner " + JSON.stringify(data));

                if(!data) {
                    var ccowner = {
                        fullname: String,
                        address1: String,
                        address2: String,
                        address3: String,
                        city: String,
                        state: String,
                        country: String,
                        zipcode: String
                    };

                    ccowner.fullname = Global.user.name;
                    ccowner.address1 = Global.user.address1;
                    ccowner.address2 = Global.user.address2;
                    ccowner.address3 = Global.user.address3;
                    ccowner.city     = Global.user.city;
                    ccowner.state    = Global.user.state;
                    ccowner.country  = Global.user.country;
                    ccowner.zipcode  = Global.user.zipcode;

                    $scope.ccowner = ccowner;


                }else {
                    $scope.ccowner = data;
                }

                data = CcDetailsService.popItem();
                if(!data) {
                    $scope.ccdetails = {
                      cardtype: 'VISA',
                      cardnum: '',
                      cardcvv: '',
                      expirymonth: '',
                      expiryyear: ''
                    };
                }else {
                    $scope.ccdetails = data;
                }
                //
            });


        })
        .error(function(data){
            $scope.totalAmount = 0;
            console.log("error in getting profile");
        });



        // dead weight
        $scope.whatLabel = function(index) {
            if (index === 0)
              return 'Western Union';
            if (index === 1)
              return 'Credit/Debit Card';
        };

        $scope.showWU = function(paymentMode) {
              var retValue = angular.equals(paymentMode, 'WU');
              return !retValue;
        };

        $scope.showCC = function(paymentMode) {
          var retValue = angular.equals(paymentMode, 'CC');
          return !retValue;

        };

        $scope.toTransaction = function() {
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/checkout');

        };

        $scope.toShipTo = function() {
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/shipto');

        };

        $scope.toBilling = function() {
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/billing');

        };

        $scope.toReview = function() {
            //$scope.ccdetails.cardnum = hideCCInfo($scope.ccdetails);
            //console.log('CCDetails ' + JSON.stringify($scope.ccdetails));
            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/review');

        };


        $scope.saveWesternUnionInfo = function() {
            ProformaService.addItem($scope.proforma);
            clearCCInfo();
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/review');

        };

        $scope.saveBillingInfo = function() {
            //$scope.ccdetails.cardnum = hideCCInfo($scope.ccdetails);
            //console.log('CCDetails ' + JSON.stringify($scope.ccdetails));

            ProformaService.addItem($scope.proforma);
            CcOwnerService.addItem($scope.ccowner);
            CcDetailsService.addItem($scope.ccdetails);
            changeLocation('/review');

        };

        var clearCCInfo = function() {
            $scope.ccdetails = {
              cardtype: '',
              cardnum: '',
              cardcvv: '',
              expirymonth: '',
              expiryyear: ''
            };

            $scope.ccowner = {
              fullname: '',
              address1: '',
              address2: '',
              address3: '',
              city: '',
              state: '',
              country: '',
              zipcode: ''
            };
        };
        /*
        var hideCCInfo = function(ccData) {
            cardnum = ccData.cardnum;
            console.log('CC Num ' +  cardnum + 'cVc ' + ccData.cardcvv);
            console.log('CC Num length ' + cardnum.length);
            j = cardnum.length - 5;
            while (j >= 0) {
                c = cardnum.charAt(j);
                console.log('Index ' + j + ' Character ' + c);
                if (c == ' ' || c == '-') {
                  console.log('\tDo nothing with ' + c);
                }
                else {
                   console.log('\tReplace with X ');
                   cardnum = setCharAt(cardnum,j,'X');
                }
                j--;
            }
            console.log('Card Num ' + ccData.cardnum);
            console.log('Hide Num ' + cardnum);
            return cardnum;
        };

        var setCharAt = function(str,index,chr) {
            if(index > str.length-1) return str;
            return str.substr(0,index) + chr + str.substr(index+1);
        };
        */

         // from http://www.yearofmoo.com/2012/10/more-angularjs-magic-to-supercharge-your-webapp.html#apply-digest-and-phase
        var changeLocation = function(url, force) {
            //this will mark the URL change
            $location.path(url); //use $location.path(url).replace() if you want to replace the location instead

            $scope = $scope || angular.element(document).scope();
            if(force || !$scope.$$phase) {
                //this will kickstart angular if to notice the change
                $scope.$apply();
            }
        };


    }]);
