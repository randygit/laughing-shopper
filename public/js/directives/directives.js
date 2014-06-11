
//var app = angular.module('mean', []);


// http://stackoverflow.com/questions/12864887/angularjs-integrating-with-server-side-validation

/*
window.app.directive('validateUsername', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.busy = false;
      scope.$watch(attrs.ngModel, function(value) {

        // hide old error messages
        ctrl.$setValidity('invalidChars', true);

        if (!value) {
          // don't send undefined to the server during dirty check
          // empty username is caught by required directive
          return;
        }

        if (value !== encodeURIComponent(value)) {
          ctrl.$setValidity('invalidChars', false);
          return;
        }

      });
    }
  };
});
*/

/*
window.app.directive('uniqueUsername', ['$http', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.busy = false;
      scope.$watch(attrs.ngModel, function(value) {

        // hide old error messages
        ctrl.$setValidity('isTaken', true);
        ctrl.$setValidity('invalidChars', true);

        if (!value) {
          // don't send undefined to the server during dirty check
          // empty username is caught by required directive
          return;
        }

        scope.busy = true;
        $http.post('/signup/check/username', {username: value})
          .success(function(data) {
            // everything is fine -> do nothing
            scope.busy = false;
          })
          .error(function(data) {

            // display new error message
            if (data.isTaken) {
              ctrl.$setValidity('isTaken', false);
            } else if (data.invalidChars) {
              ctrl.$setValidity('invalidChars', false);
            }

            scope.busy = false;
          });
      });
    }
  };
}]);
*/

/*
window.app.directive('uniqueEmail', ['$http', function($http) {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            scope.busy = false;
            scope.$watch(attrs.ngModel, function(value) {

                // hide old error messages
                ctrl.$setValidity('isTaken', true);
                ctrl.$setValidity('invalidChars', true);

                if (!value) {
                    // don't send undefined to the server during dirty check
                    // empty username is caught by required directive
                    return;
                }

                scope.busy = true;
                $http.post('/signup/check/email', {email: value})
                    .success(function(data) {
                        console.log("SUCCESS: /signup/check/email returns ");
                        // everything is fine -> do nothing
                        scope.busy = false;
                    })
                    .error(function(data) {
                        // display new error message
                        console.log("ERROR: /signup/check/email 403 ");
                        console.log("ERROR: /signup/check/email isTaken is true " + data.isTaken);
                        ctrl.$setValidity('isTaken', false);
                        console.log("ERROR: /signup/check/email invalid characters");
                        ctrl.$setValidity('invalidChars', false);


                        // cannot read the json data.
                        if (data.isTaken) {
                            console.log("ERROR: /signup/check/email isTaken is true " + data.isTaken);
                            ctrl.$setValidity('isTaken', false);
                        } else if (data.invalidChars) {
                            console.log("ERROR: /signup/check/email invalid characters");
                            ctrl.$setValidity('invalidChars', false);
                        }


                        scope.busy = false;
                    });
            });
        }
    };
}]);


window.app.directive('uniqueUsername', ['$http', function($http) {
  return {
    require: 'ngModel',
    scope: {
        email: '='
    },
    link: function(scope, elem, attrs, ctrl) {
      scope.busy = false;
      scope.$watch(attrs.ngModel, function(value) {

        // hide old error messages
        ctrl.$setValidity('isTaken', true);
        ctrl.$setValidity('invalidChars', true);

        if (!value) {
          // don't send undefined to the server during dirty check
          // empty username is caught by required directive
          return;
        }

        console.log('inside uniqueUsername directive ' + value + ' email: ' + email);
        scope.busy = true;
        $http.post('/validate/username', {username: value}, email)
          .success(function(data) {
              console.log('Success. username ' + value + ' is AVAILABLE');
              // everything is fine -> do nothing
              scope.busy = false;
          })
          .error(function(data) {
              console.log('ERROR. username ' + value + ' is USED');
              ctrl.$setValidity('isTaken', false);
              scope.busy = false;
          });
      });
    }
  };
}]);

*/

window.app.directive('passwordValidate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {

                scope.pwdValidLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);
                scope.pwdHasLetter = (viewValue && /[A-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;

                if(scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber) {
                    ctrl.$setValidity('pwd', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('pwd', false);
                    return undefined;
                }

            });
        }
    };
});

// http://www.the-art-of-web.com/javascript/validate/3/
window.app.directive('creditcardValidate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {

                scope.stripped = viewValue.replace(/[^\d]/g, '');

                var sum = 0;
                var numdigits = scope.stripped.length;
                var parity = numdigits % 2;
                for(var i=0; i < numdigits; i++) {
                  var digit = parseInt(scope.stripped.charAt(i));
                  if(i % 2 == parity) digit *= 2;
                  if(digit > 9) digit -= 9;
                  sum += digit;
                }
                modu = sum % 10;
                if (modu === 0) {
                    ctrl.$setValidity('invalidcc', true);
                    return viewValue;
                }
                else {
                    ctrl.$setValidity('invalidcc', false);
                    return viewValue;
                }
            });
        }
    };
});
// http://codepen.io/brunoscopelliti/pen/ECyka

window.app.directive('match', [function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {

      scope.$watch('[' + attrs.ngModel + ', ' + attrs.match + ']', function(value){
        ctrl.$setValidity('match', value[0] === value[1] );
      }, true);

    }
  };
}]);


window.app.directive('onlyDigits', function () {

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return;
            ngModel.$parsers.unshift(function (inputValue) {
                var digits = inputValue.split('').filter(function (s) { return (!isNaN(s) && s != ' '); }).join('');
                ngModel.$viewValue = digits;
                ngModel.$render();
                return digits;
            });
        }
    };
});

// by Endy Tjahjono
window.app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    };
}]);

// by zsong
window.app.directive('validFile', [function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {
            ngModel.$render = function () {
                ngModel.$setViewValue(el.val());
            };

            el.bind('change', function () {
                scope.$apply(function () {
                    ngModel.$render();
                });
            });
        }
    };
}]);

// http://stackoverflow.com/questions/5917082/regular-expression-to-match-numbers-with-or-without-commas-and-decimals-in-text
window.app.directive('onlyNumbers', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           // this next if is necessary for when using ng-required on your input.
           // In such cases, when a letter is typed first, this parser will be called
           // again, and the 2nd time, the value will be undefined
           if (inputValue === undefined) return '';
           var transformedInput = inputValue.replace(/[^0-9^.]/g, '');
           if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }

           return transformedInput;
       });
     }
   };
});
