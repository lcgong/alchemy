
  angular.module('mainapp').controller('ReposDtlCtrl', ReposDtlCtrl);
  ReposDtlCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
  function ReposDtlCtrl($scope, $q, $state, $timeout, util, ReposModel) {

    $scope.editable = true;
    $scope.reposDesc = {};
    $scope.repos_sn = parseInt($state.params['repos_sn']);
    if (isNaN($scope.repos_sn)) {
        $scope.repos_sn = 0; // 0 means it's new.
    }
    $scope.reposDesc.repos_sn = $scope.repos_sn;

    console.log('ReposDtlCtrl ', $scope.repos_sn);

    var ctrl = this;


    ctrl.removeRepos = function() {
      ReposModel.removeRepos($scope.repos_sn).then(function(data) {
        util.notifySuccess('已删除');
        $state.go('repos.list');
      });
    }
  }
