
angular.module('mean.roles').controller('UserRoleController', ['$scope', '$location','$route', 'Global', '$window','$http','$modal', 'Roles', function ($scope, $location, $route, Global, $window, $http, $modal, Roles ) {

    // initialization
    $scope.headers = ["Name", "Email", "Role", "Status", "Option"];
    $scope.form = {};
    $scope.columnSort = { sortColumn: 'name', reverse: false };

    $scope.window = $window;
    $scope.global = Global;

    // use a factory called Countries to get data from $http
    Roles.getData().then(function(data) {
        $scope.positionData = data;
        $http.get('/api/roles').
          success(function(user, status, headers, config) {
              $scope.users = user;
        });

    });





    $scope.updateRole= function (id, name, role, deactivated) {

        var Role = {
          name: String,
          role: Number,
          deactivated: Boolean
        };

        Role.id = id;
        Role.name = name;
        Role.role = role;
        Role.deactivated = deactivated;

        /*
        console.log("ng-submit updateRole");
        console.log('ID          : ' + id);
        console.log('Name        : ' + Role.name);
        console.log('Role        : ' + Role.role);
        console.log('Deactivated : ' + Role.deactivated);
        */
        $http.post('/api/role/' + id, Role)
                    .success(function(data) {
                        console.log("Success. back from /user/profile");
                        $route.reload();

                  })
                  .error(function(data){
                      console.log("error in saving profile");
                      $route.reload();
                });

    };

    $scope.view = function(id) {
        console.log('Inside View function ' + id);
        var allheaders = ["name", "phone", "email", "facebook", "twitter", "skype"];
        $http.get('/api/role/' + id).
            success(function(data, status, headers, config) {
                if (data.status) {
                    console.log('contact' + JSON.stringify(data.contact));
                    $scope.contact = data.contact;

                    $modal.open({
                        templateUrl: '/views/contacts/partials/viewContact.html',
                        backdrop: true,
                        windowClass: 'modal',
                        controller: viewContactCtrl,
                        resolve: {
                            contact: function() {
                                return data.contact;
                            }
                        }
                    });   // $modal.open
                } else {
                    $location.path('/');
                }
            });
    };

    var viewContactCtrl = function($scope, $modalInstance, contact ) {

        console.log('inside viewContactCtrl ' + JSON.stringify(contact));
        $scope.contact = contact;
        $scope.allheaders = ["name", "phone", "email", "facebook", "twitter", "skype"];

        $scope.closeView = function() {
            $modalInstance.dismiss('cancel');
        };

    };


    $scope.edit = function(id, name) {
        console.log('Inside Edit function ' + name+ " id " + id);
        // read data first
        $http.get('/api/role/' + id).
            success(function(data, status, headers, config) {
                if (data.status) {
                    console.log('contact' + JSON.stringify(data.contact));
                    $scope.contact = data.contact;

                    var modalInstance = $modal.open({
                        templateUrl: '/views/contacts/partials/editContact.html',
                        backdrop: true,
                        windowClass: 'modal',
                        controller: editContactCtrl,
                        resolve: {
                            contact: function() {
                                return data.contact;
                            }
                        }
                    });   // $modal.open

                    // wait for result and save data

                    modalInstance.result.then(function(contact) {
                        console.log('Result ' + JSON.stringify(contact));
                        console.log('Key ' + contact._id);
                        // save data here
                        if (contact) {
                            console.log('Some data to save');

                            // will force api/contact to redirect
                            $http.put('/api/contact/'+contact._id, contact).success(function(data) {

                                console.log("Success. updating record at /api/contact");
                                $route.reload();
                            })
                            .error(function(data) {
                                console.log("Error. adding record at /api/contact");
                                $scope.window.location = '/';
                            });

                        }
                        else {
                            console.log('No data to save');
                            $scope.window.location = '/contact';
                        }
                    });

                } else {
                    $scope.window.location('/');
                }
            });

    };


    var editContactCtrl = function($scope, $modalInstance, contact ) {

        console.log('inside editContactCtrl ' + JSON.stringify(contact));
        $scope.edit = contact;

        // data is returned through contact variable
        $scope.editContact = function (contact) {
            console.log('inside editContact()');
            console.log('EDitContact ' + JSON.stringify(contact));
            $modalInstance.close(contact);
        };

        $scope.closeEdit = function() {
            console.log('inside closeEdit()');
            $modalInstance.dismiss('cancel');
            // save data
        };

    };




    $scope.opts = {
        backdropFade: true,
        dialogFade: true
    };

}]);
