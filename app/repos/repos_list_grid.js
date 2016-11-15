
angular.module('mainapp').controller('ReposListGridCtrl', ReposListGridCtrl);
ReposListGridCtrl.$inject = ['$scope', '$q', '$state', 'util', 'ReposModel'];
function ReposListGridCtrl($scope, $q, $state, util, ReposModel) {
  let ctrl = this;
  ctrl.listSource = $state.params['source'];
  console.log('ReposListGridCtrl', ctrl.listSource);


  

}
