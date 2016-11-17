import "./questlist.css!";

import "./quest.model";

angular.module('mainapp').controller('TrashlistCtrl', TrashlistCtrl);
TrashlistCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'QuestModel'];
function TrashlistCtrl($scope, $q, $state, $timeout, util, QuestModel) {

  let ctrl = this;
  ctrl.mode = "listing";

  ctrl.open = function() {
    if ($scope.repos_sn === 0) {
      return;
    }

    QuestModel.listTrashedQuestions($scope.repos_sn).then(function(data) {
      ctrl.items = data;
    });
  };

  $scope.$on('questionTrashed', function(evt, quest_sn) {
    $state.go('repos.workshop.questlist', {
      repos_sn: $scope.repos_sn,
      source: ctrl.listSource
    }).then(function(){
      util.notifySuccess('原试题移到了回收箱');
    });
  });

  //
  $timeout(() => { ctrl.open(); }, 0); // to load data initially
}
