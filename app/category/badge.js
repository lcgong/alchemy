import "./badge.css!"

angular.module('mainapp').controller('badgeCardCtrl', badgeCardCtrl);
badgeCardCtrl.$inject = ['$scope', '$element', '$attrs'];
function badgeCardCtrl($scope, $element, $attrs) {
  let $ctrl = this;

  $ctrl.saveForLater = function() {
    let question = $scope.question;
    if (!question.saveForLater) {
      question.saveForLater = {
        taggedTime: new Date()
      };
    } else {
      question.saveForLater = null;
    }
  };

  $ctrl.addToKnowledge = function(category) {
    category = angular.copy(category);
    category.taggedTime = new Date();
    $scope.question.categories[category.label] = category;
  };

  $ctrl.addTag = function(tag) {
    tag = angular.copy(tag);
    tag.taggedTime = new Date();
    $scope.question.tags[tag.label] = tag;
  };

  $ctrl.removeCategory= function(label) {
    console.log('dddd', label)
    delete $scope.question.categories[label];
  }


  $ctrl.removeTag= function(label) {
    delete $scope.question.tags[label];
  }
}


angular.module('mainapp').directive('questionBadgeBar', questionBadgeBar);
questionBadgeBar.$inject = ['$compile', '$timeout'];
function questionBadgeBar($compile, $timeout) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      question: '=',
      repository: '=',
      mode: '&?'
    },
    templateUrl: 'app/category/badge.html',
    controller: 'badgeCardCtrl',
    controllerAs: '$ctrl',
    link: function($scope, $element, $attrs, ctrl) {
      // if ($attrs.purpose) {
      //   $scope.$parent.$watch($attrs.purpose, purpose => {
      //     // $scope.purpose = makeCatgeoryDictTuple(categories);
      //   }, true);
      // }

      // $scope.$watch('question.questionStyle', questionStyle => {
      // });

      // $scope.allCategories = {};
      // $scope.allTags = {};
      $scope.hovers = {};

      $scope.mode = $scope.mode();

      console.log(333, $scope.question);


      $scope.$watch('question.categories', categories => {
        let repo = $scope.repository;
        $scope.categoryList = convertToList(categories, repo.categories);
      }, true);

      $scope.$watch('question.tags', tags => {
        let repo = $scope.repository;
        $scope.tagList = convertToList(tags, repo.tags);
      }, true);

    }
  }

}


/** [[{cat_item_1...}, {cat_item_2a, cat_item_2b, ...} ], ...] */
export function convertToList(categories, allCategories) {
  if (typeof categories === 'undefined' || categories == null) {
    return [];
  }

  let data = {};
  for (label of Object.keys(categories).sort()) {
    let labelParts = label.split('/', 2)
    if (labelParts.length == 2) {
        let level1_label = labelParts[0];
        let level1_item = data[level1_label];
        if (!level1_item) {
          level1_item = categories[level1_label];
          if (!level1_item) {
            level1_item = allCategories[level1_label];
            if (!level1_item) {
              level1_item = { label: level1_label };
            }
          }

          if (!level1_item.label) {
            level1_item.label = level1_label;
          }

          level1_item = [level1_item, []];
          data[level1_label] = level1_item;
        }

        item = categories[label];
        item.label = label;
        item.name = labelParts[1];
        level1_item[1].push(item);

    } else if (labelParts.length == 1) {
      let item = categories[label]
      if (!item.label) {
        item.label = label;
      }
      data[label] = [item, []]
    } else {
      console.error('!!!');
    }
  }

  console.log(555, angular.copy(data))

  data = Object.values(data); // list
  data.sort(compareLabelItem);

  for (item of data) { // 对第二级进行排序
    item[1].sort(_compareLabelItem);
  }

  console.log(444, angular.copy(data))

  return data;
}

export function compareLabelItem(a, b) {
  return _compareLabelItem(a[0], b[0]);
}

function _compareLabelItem(a, b) {
  if (typeof a.order !== 'undefined' &&
      typeof b.order !== 'undefined' &&
      typeof a.order !== null &&
      typeof b.order !== null ) {
        if (a.order < b.order) {
          return -1;
        }

        if (a.order > b.order) {
          return 1;
        }

        if (a.label < b.label) {
          return -1;
        }

        if (a.label > b.label) {
          return 1;
        }

        return 0;
  } else {
    if (a.label < b.label) {
      return -1;
    }

    if (a.label > b.label) {
      return 1;
    }

    return 0;
  }
}
