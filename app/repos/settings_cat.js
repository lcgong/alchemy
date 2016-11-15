import {convertToList as convertLabelDictToList} from "app/category/badge";

angular.module('mainapp').controller('CatEditorCtrl', CatEditorCtrl);
CatEditorCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReposModel'];
function CatEditorCtrl($scope, $q, $state, $timeout, util, ReposModel) {
  console.log('CatEditorCtrl ', $scope.repos_sn);
  var ctrl = this;


  ctrl.update = function() {
    let params = {
      repos_sn: $scope.repos_sn,
      text: $scope.text
    };

    ReposModel.updateCategoryText(params).then(function(data) {
      $scope.items = data;
      // $scope.text = '';
      $timeout(() => { ctrl.open(); }, 0);
    });
  };


  ctrl.removeTag = function(item) {
    let params = {
      repos_sn: $scope.repos_sn,
      label_sn: item.label_sn
    };

    ReposModel.removeCategory(params).then(function(data) {
      $timeout(() => { ctrl.open(); }, 0);
    });
  }


  ctrl.open = function() {

    ReposModel.listCategories($scope.repos_sn).then(function(data) {
      if (!data || data.length == 0) {
        return;
      }


      data = convertLabelDictToList(data[0]);

      let items = [];
      let texts = [];
      for (item of data ) {
        texts.push(item[0].label);
        item[0].name = item[0].label;
        item[0].depth = 1;
        items.push(item[0])

        for (subitem of item[1]) {
          subitem.depth = 2;
          items.push(subitem);
          texts.push('    ' + subitem.name);
        }
      }

      $scope.items = items;
      $scope.text = texts.join('\r\n');
    });
  };

  $timeout(() => { ctrl.open(); }, 0); // to load data initially
}
