'use strict';
var app = angular.module('mainapp');

app.factory('ApproveDialog', ApproveDialog);
ApproveDialog.$injector = ['$modal', '$http', '$q'];

function ApproveDialog($modal, $http, $q) {
  return {
    open: open
  }

  function open(title) {
    var uibModalInstance = $modal.open({
      templateUrl: 'app/comp/service/ApproveDialog.html',
      controller: uibModalInstanceCtrl,
      keyboard: true, // 按ESC可退出
      backdrop: true, // 按背景也可退出
      resolve: {
        wfInfo: function() {
          return {
            title: title
          }
        }
      }
    });
    return uibModalInstance.result;
  }
}

uibModalInstanceCtrl.$injector = ['$scope', '$uibModalInstance', 'wfInfo'];
function uibModalInstanceCtrl($scope, $uibModalInstance, wfInfo) {

  $scope.title = wfInfo.title;
  console.log($scope.title);
  $scope.wfForm = {};

  $scope.agree = function() {
    $uibModalInstance.close({
      opinion: '同意',
      notes: $scope.wfForm.notes
    });
  };

  $scope.reject = function() {
    $uibModalInstance.close({
      opinion: '拒绝',
      notes: $scope.wfForm.notes
    });
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}
