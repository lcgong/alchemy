import "./badge.css!"

angular.module('mainapp').controller('badgeCardCtrl', badgeCardCtrl);
badgeCardCtrl.$inject = ['$scope', '$element', '$attrs'];
function badgeCardCtrl($scope, $element, $attrs) {
  let ctrl = this;
}


angular.module('mainapp').directive('questionBadge', questionBadge);
questionBadge.$inject = ['$compile', '$timeout'];
function questionBadge($compile, $timeout) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {},
    templateUrl: 'app/category/badge.html',
    controller: 'badgeCardCtrl',
    link: function($scope, $element, $attrs, ctrl) {
      if ($attrs.purpose) {
        $scope.$parent.$watch($attrs.purpose, purpose => {
          // $scope.purpose = makeCatgeoryDictTuple(categories);
        }, true);
      }

      if ($attrs.questionStyle) {
        $scope.$parent.$watch($attrs.questionStyle, questionStyle => {
          $scope.questionStyle = questionStyle;
        });
      }

      $scope.allCategories = {};
      $scope.allTags = {};
      $scope.hovers = {};

      if ($attrs.categories) {
        $scope.$parent.$watch($attrs.categories, categories => {
          $scope.categories = convertToList(categories, $scope.allCategories);
          // console.log(344555, $scope.categories);
        }, true);
      }

      if ($attrs.tags) {
        console.log(3399999, $attrs.tags);
        $scope.$parent.$watch($attrs.tags, tags => {
          console.log(3399999, tags);
          $scope.tags = convertToList(tags, $scope.allTags);
          console.log(344555, $scope.tags);
        }, true);
      }

    }
  }

  /** [[{cat_item_1...}, {cat_item_2a, cat_item_2b, ...} ], ...] */
  function convertToList(categories, allCategories) {

    let data = {};
    for (label of Object.keys(categories)) {
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

            level1_item = [level1_item, []];
            data[level1_label] = level1_item;
          }

          item = categories[label];
          item.name = labelParts[1];
          level1_item[1].push(item);

      } else if (labelParts.length == 1) {
        data[label] = [categories[label], []]
      } else {
        console.error('!!!');
      }
    }

    return Object.keys(data).sort().map(label => {
      let item = data[label];

      let level2Items;
      level2Items = item[1].sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });;

      return [item[0], level2Items]
    });

  }
}
