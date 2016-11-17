import "./questlist.css!";

import "./quest.model";

angular.module('mainapp').controller('QuestlistCtrl', QuestlistCtrl);
QuestlistCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'QuestModel'];
function QuestlistCtrl($scope, $q, $state, $timeout, util, QuestModel) {

  let ctrl = this;
  ctrl.listSource = $state.params['source'];
  console.log('QuestlistCtrl, repos_sn=%d, source=%s', $scope.repos_sn, ctrl.listSource);

  ctrl.mode = 'listing';


  ctrl.open = function() {
    if ($scope.repos_sn === 0 || angular.isUndefined(ctrl.listSource)) {
      return;
    }

    QuestModel.list($scope.repos_sn, ctrl.listSource).then(function(data) {
      ctrl.items = data;
      console.log(data)
    });
  };

  ctrl.openQuestpad = function(quest_sn) {
    $state.go('repos.workshop.questpad', {
      repos_sn: $scope.repos_sn,
      quest_sn: quest_sn
    });
  };

  //
  $timeout(() => { ctrl.open(); }, 0); // to load data initially
}
