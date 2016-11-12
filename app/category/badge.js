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
    scope: true,
    templateUrl: 'app/category/badge.html',
    controller: 'badgeCardCtrl',
    link: function($scope, $element, $attrs, ctrl) {
      // $scope.$watch('purpose', categories => {
      // }, true);
      //
      // $scope.$watch('questionStyle', categories => {
      // }, true);
      //
      $scope.$watch('categories', categories => {
        $scope.categories = makeCatgeoryDictTuple(categories);
      }, true);

      if ($attrs.tags) {
        $scope.$watch($attrs.tags, tags => {
          $scope.tags = tags.sort();
        }, true);
      }

      // console.log($scope.question);

    }
  }

  /** [[cat1, [cat2a, cat2b, ...] ], ...] */
  function makeCatgeoryDictTuple(categorys) {
    let categoryDict = {};
    for (item of categorys.sort().map(s => s.split('/', 2))) {

      if (item.length == 0 and)
      if (cat1 != item[0]) {
        if (item.length > 1 && item[1] && item[1].length > 0) {
          // 如果分类A/1, 接着就是B/1，而不是标准的 A/1, B, B/1
          optionItems.push([item[0], '']);
        }

        cat1 = item[0];
      }

      optionItems.push([item[0], item[1]]);
    }
  }
}
