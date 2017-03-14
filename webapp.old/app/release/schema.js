import {_compareLabelItem as compareLabelItem } from 'app/category/badge';

angular.module('mainapp').controller('ReleaseSchemaCtrl', ReleaseSchemaCtrl);
ReleaseSchemaCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'util', 'ReleaseModel'];
function ReleaseSchemaCtrl($scope, $q, $state, $timeout, util, ReleaseModel) {

  console.log('ReleaseSchemaCtrl, repos_sn=%d', $scope.repos_sn);
  console.log($scope.repos);

  let ctrl = this;

  ctrl.load = function() {
  };

  ctrl.load();

  $scope.schema = {
    sections: [{
      title: null, // 节标题
      blank_count: 0,
      points: 0,
      selectors : [{
        questiongstyle: null,
        tags: []
      }]
    }]
  };

  $scope.addSection = function(sections) {
    sections.push({
      title: null, // 节标题
      blank_count: 0,
      points: 0,
      selectors : [{
        questiongstyle: null,
        tags: []
      }]
    });
  };

  $scope.removeSection = function(sections, $index) {
    sections.splice($index, 1);
    if (sections.length == 0) {
      // append a new one automatically
      sections.push({
        title: null, // 节标题
        blank_count: 0,
        points: 0,
        selectors : [{
          questiongstyle: null,
          tags: []
        }]
      });
    }
  }

  $scope.addTag = function(tags, $selected) {
    let idx = tags.indexOf($selected.label);
    if (idx < 0) {
      tags.push($selected.label);
      tags.sort();
    }
    // console.log('addTag', tags, $selected);
  }

  $scope.removeTag = function(tags, label) {
    let idx = tags.indexOf(label);
    if (idx>=0) {
      tags.splice(idx, 1);
    }
    // console.log('removeTag', tags, label, $index);
  }

  $scope.removeSelector = function(selectors, selector, $index) {
    selectors.splice($index, 1);
    if (selectors.length == 0) {
      // append a new one automatically
      selectors.push({
        questiongstyle: null,
        tags: []
      });
    }
    // console.log('removeSelector', selectors, selector, $index);
  }

  $scope.addSelector = function(selectors) {
    selectors.push({
      questiongstyle: null,
      tags: []
    });
  }

  $scope.$watch('schema.sections', function(sections) {
    console.log(sections);

    let selectorCols = [];
    for (let section of sections) {
      for (let selector of section.selectors) {
          selectorCols.push(selector);
      }
    }
    $scope.selectorCols = selectorCols;

  }, true);

  $scope.$watch('repos.categories', function(categories) {
    categories = angular.copy(categories);

    for(let label in categories) {
      categories[label].label = label
    }

    let items = Object.values(categories).sort(compareLabelItem).map(item => {
      let parts = item.label.split('/', 2);
      if (parts.length == 2) {
        return [item.label, parts[0], parts[1]];
      } else if (parts.length == 1) {
        return [item.label, parts[0], null];
      } else{
        throw 'unknown';
      }
    });

    $scope.catItems = items;

    console.log(123, items);

  });

  $scope.save = function() {
    ReleaseModel.save(this).then(function(){

    })
  }

  // section {title, blankCount, points, selectors (questiongstyle, tags) }
}
