angular.module('mainapp').controller('QuestWorkshopCtrl', QuestWorkshopCtrl);
QuestWorkshopCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
function QuestWorkshopCtrl($scope, $q, $state, $timeout, util, ReposModel) {

  $scope.editable = true;
  $scope.repos_sn = parseInt($state.params['repos_sn']);
  if (isNaN($scope.repos_sn)) {
      $scope.repos_sn = 0; // 0 means it's new.
  }

  console.log('QuestWorkshopCtrl ', $scope.repos_sn);

  var ctrl = this;

}
