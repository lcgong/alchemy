import "./badge.css!"

angular.module('mainapp').controller('badgeCardCtrl', badgeCardCtrl);
badgeCardCtrl.$inject = ['$scope', '$element', '$attrs', 'QuestModel', 'util'];
function badgeCardCtrl($scope, $element, $attrs, QuestModel, util) {
  let $ctrl = this;

  $ctrl.saveForLater = function() {
    let quest_sn = $scope.question.quest_sn;
    if (!(quest_sn > 0)) {
      util.fail('“新题”需要保存一次后，才可以做备忘');
      return;
    }

    let status =  $scope.question.saveForLater == null;

    QuestModel.setSaveForLater(quest_sn, status).then(function(data) {
      if (!data[0]) {
        $scope.question.saveForLater = null;
      } else {
        $scope.question.saveForLater = data[0];
      }
      console.log('saveForLater: ', $scope.question.saveForLater);
    });

  };


  $ctrl.addToKnowledge = function(category) {
    let quest_sn = $scope.question.quest_sn;
    if (!(quest_sn > 0)) {
      util.fail('新题需要保存一次后，才可以添加知识要点');
      return;
    }

    let labels = Object.keys($scope.question.categories);

    labels.push(category.label);

    QuestModel.updateLabels(quest_sn, 'categories', labels).then(function(data) {
      $scope.question.categories = data[0];
    });
  };

  $ctrl.removeCategory= function(label) {

    let quest_sn = $scope.question.quest_sn;
    let labels = Object.keys($scope.question.categories);

    labels.splice(labels.indexOf(label), 1)

    QuestModel.updateLabels(quest_sn, 'categories', labels).then(function(data) {
        $scope.question.categories = data[0];
    });

  }


  $ctrl.addTag = function(tag) {
    let quest_sn = $scope.question.quest_sn;

    if (!(quest_sn > 0)) {
      util.fail('新题需要保存一次后，才可以添加标签');
      return;
    }


    let labels = Object.keys($scope.question.tags);

    labels.push(tag.label);

    QuestModel.updateLabels(quest_sn, 'tags', labels).then(function(data) {
      $scope.question.tags = data[0];
    });

  };

  $ctrl.removeTag= function(label) {

    let quest_sn = $scope.question.quest_sn;
    let labels = Object.keys($scope.question.tags);

    labels.splice(labels.indexOf(label), 1)

    QuestModel.updateLabels(quest_sn, 'tags', labels).then(function(data) {
        $scope.question.tags = data[0];
    });
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
