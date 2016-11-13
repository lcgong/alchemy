'use strict';

var app = angular.module('mainapp');


app.factory('ConfirmDialog', ConfirmDialog);
ConfirmDialog.$injector = ['$injector'];

function ConfirmDialog($injector) {
  return {
    open: open,
  };

  function open(message) {
    var config = {
      templateUrl: 'app/comp/service/ConfirmDialog.html',
      controller: ConfirmDialogCtrl,
      keyboard: true, // 按ESC可退出
      backdrop: true,
      resolve: {
        dialog: function() {
          return {
            message: message
          };
        }
      }
    };

    var $uibModal = $injector.get('$uibModal');
    return $uibModal.open(config).result;
  }
}

ConfirmDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'dialog'];

function ConfirmDialogCtrl($scope, $uibModalInstance, dialog) {
  $scope.dialog = dialog;
}
