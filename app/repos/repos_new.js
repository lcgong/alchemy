
angular.module('mainapp').controller('ReposNewCtrl', ReposNewCtrl);
ReposNewCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
function ReposNewCtrl($scope, $q, $state, $timeout, util, ReposModel) {

  var ctrl = this;

  $scope.reposDesc = {};

  ctrl.create = function() {
    ReposModel.create($scope.reposDesc).then(function(data) {
      util.notifySuccess('题库创建成功');
      $state.go('repos.workshop.questpad', {
        repos_sn: data[0].repos_sn,
        quest_sn: 0
      }); // 转入新题库的写题板
    });
  };

}
