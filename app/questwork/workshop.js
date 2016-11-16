import {convertToList as convertLabelDictToList} from "app/category/badge";


angular.module('mainapp').controller('QuestWorkshopCtrl', QuestWorkshopCtrl);
QuestWorkshopCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
function QuestWorkshopCtrl($scope, $q, $state, $timeout, util, ReposModel) {


  var ctrl = this;
  $scope.repos_sn = parseInt($state.params['repos_sn']);
  if (isNaN($scope.repos_sn)) {
      $scope.repos_sn = 0; // 0 means it's new.
  }
  console.log('QuestWorkshopCtrl, repos_sn=%d', $scope.repos_sn);

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

      console.log("repos %d loaded: %O", $scope.repos_sn, $scope.repos);
      // console.log('repos=', $scope.repos);
    });
  };

  // $timeout(function() { ctrl.load() });
  ctrl.load();

  // $scope.$watch('repos.questionStyles', questionStyles => {
  //   if (typeof questionStyles !== 'undefined' && questionStyles != null ) {
  //     return;
  //   }
  //
  //
  // });



}
