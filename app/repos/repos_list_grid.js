
angular.module('mainapp').controller('ReposListGridCtrl', ReposListGridCtrl);
ReposListGridCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
function ReposListGridCtrl($scope, $q, $state, $timeout, util, ReposModel) {
  let ctrl = this;
  ctrl.listSource = $state.params['source'];
  console.log('ReposListGridCtrl', ctrl.listSource);


  ctrl.open = function() {
    if ($scope.repos_sn === 0) { // it new repos object
      return;
    }

    ReposModel.listBriefs({source: ctrl.listSource}).then(function(data) {
      ctrl.items = data;
      console.log(data)
    });
  };

  ctrl.pindown = function(item) {
    if (item.pinned)  {
      item.pinned = null;
    } else {
      item.pinned = new Date();
    }
  }

  $timeout(() => { ctrl.open(); }, 0); // to load data initially
}
