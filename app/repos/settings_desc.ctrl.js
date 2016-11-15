
  angular.module('mainapp').controller('ReposDtlDescCtrl', ReposDtlDescCtrl);
  ReposDtlDescCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
  function ReposDtlDescCtrl($scope, $q, $state, $timeout, util, ReposModel) {

    // repos_sn是从父范围内传递过来的
    console.log('ReposDtlDescCtrl, repos_sn=%d', $scope.repos_sn);

    var ctrl = this;

    $scope.editable = true;

    ctrl.open = function() {
      if ($scope.repos_sn === 0) { // it new repos object
        return;
      }

      ReposModel.get_desc($scope.repos_sn).then(function(data) {
        angular.extend($scope.reposDesc, data[0]);

        // $timeout(function() {
        //   $scope.frm.$setPristine();
        // }, 0);
      });
    };

    ctrl.save = function() {
      if ($scope.repos_sn === 0) {
        ReposModel.create($scope.reposDesc).then(function(data) {
          util.notifySuccess('凭证成功创建');
          $state.go('repos.dtl.desc', {
            repos_sn: data[0].repos_sn
          });
        });
      } else {
        ReposModel.save($scope.reposDesc).then(function(data) {
          util.notifySuccess('保存成功');
          $state.go('repos.dtl.desc', {
            repos_sn: data[0].repos_sn
          });
        });
      }
    };

    $timeout(() => { ctrl.open(); }, 0); // to load data initially
  }
