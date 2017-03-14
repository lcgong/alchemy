import {convertToList as convertLabelDictToList} from "app/category/badge";

angular.module('mainapp').controller('TagEditorCtrl', TagEditorCtrl);
TagEditorCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
function TagEditorCtrl($scope, $q, $state, $timeout, util, ReposModel) {
  console.log('TagEditorCtrl ', $scope.repos_sn);
  var ctrl = this;


  ctrl.add = function() {
    // console.log($scope.tagText);


    let serviceAction;
    if ($scope.target=='QuestionStyle') {
      serviceAction = ReposModel.addQuestionStyles
    } else if ($scope.target=='Tag') {
      serviceAction = ReposModel.addTags
    } else {
      throw 'unknown!'
    }

    let params = {
      repos_sn: $scope.repos_sn,
      text: $scope.tagText
    };

    serviceAction(params).then(function(data) {
      $scope.tags = data;
      $scope.tagText = '';
      $timeout(() => { ctrl.open(); }, 0);
    });
  };

  ctrl.removeTag = function(item) {
    let serviceAction;
    if ($scope.target=='QuestionStyle') {
      serviceAction = ReposModel.removeQuestionStyle
    } else if ($scope.target=='Tag') {
      serviceAction = ReposModel.removeTag
    } else {
      throw 'unknown!'
    }

    let params = {
      repos_sn: $scope.repos_sn,
      label_sn: item.label_sn
    };

    serviceAction(params).then(function(data) {
      $timeout(() => { ctrl.open(); }, 0);
    });
  }


  ctrl.open = function() {
    let serviceAction;
    if ($scope.target=='QuestionStyle') {
      serviceAction = ReposModel.listQuestionStyles
    } else if ($scope.target=='Tag') {
      serviceAction = ReposModel.listTags
    } else {
      throw 'unknown!'
    }

    serviceAction($scope.repos_sn).then(function(data) {
      if (data.length > 0) {
        $scope.items = convertLabelDictToList(data[0]);
      }
    });
  };

  $timeout(() => { ctrl.open(); }, 0); // to load data initially
}
