
angular.module('mainapp').controller('ReleaseCtrl', ReleaseCtrl);
ReleaseCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util',
  'ReposModel', 'ReleaseModel'];
function ReleaseCtrl($scope, $q, $state, $timeout, util,
  ReposModel, ReleaseModel) {

  let ctrl = this;
  $scope.repos_sn = parseInt($state.params['repos_sn']);
  if (isNaN($scope.repos_sn)) {
      $scope.repos_sn = 0; // 0 means it's new.
  }
  console.log('ReleaseCtrl, repos_sn=%d', $scope.repos_sn);

  if ($scope.repos_sn == 0) {
    util.fail('需选择一个试题库');
    $state.go('repos.list.grid', {
      source:'panned'
    });

    return;
  }

  $scope.repos = {
    repos_sn: $scope.repos_sn,
    questionStyles: null,
    tags: null,
    categories: null
  };

  ctrl.load = function() {
    Promise.all([
      ReposModel.getReposBriefSummary($scope.repos_sn),
      ReposModel.listQuestionStyles($scope.repos_sn),
      ReposModel.listTags($scope.repos_sn),
      ReposModel.listCategories($scope.repos_sn)]).then(values => {

      let brief = values[0][0];
      $scope.repos.title = brief.title;
      $scope.repos.brief_desc = brief.brief_desc;

      $scope.repos.questionStyles = values[1][0];
      $scope.repos.tags = values[2][0];
      $scope.repos.categories = values[3][0];

      // console.log("repos %d loaded: %O", $scope.repos_sn, $scope.repos);
    });
  };

  ctrl.load();
}
