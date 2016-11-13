'use strict';

var app = angular.module('mainapp');


app.controller("PasswordChangeDialogCtrl", PasswordChangeDialogCtrl);
PasswordChangeDialogCtrl.$inject = [
  '$scope', 'UserSessionModel', '$uibModalInstance', 'dialog'
];

function PasswordChangeDialogCtrl($scope, UserSessionModel,
  $uibModalInstance, dialog) {

  $scope.user = dialog.user;

  $scope.agree = function() {
    console.log('new-pass', $scope.user.password);
    UserSessionModel.changePassword({
      user_sn: $scope.user.user_sn,
      passwd: $scope.user.password
    }).then(function() {

      $uibModalInstance.close($scope.password);
    });
  };

  $scope.reject = function() {
    $uibModalInstance.close();
  };
}
