

import {KEY} from "./keychars";

angular.module('mainapp').controller('categorySelectCtrl', categorySelectCtrl);
categorySelectCtrl.$inject = ['$scope', '$element', '$attrs'];
function categorySelectCtrl($scope, $element, $attrs) {

  let $select = this;

  $scope.optionItems = [];

  // $scope.$watch('searchText', function(searchText) {
  //   console.log(searchText);
  // });
  // $scope.$watch('activeIndex', function(activeIndex) {
  //   console.log(activeIndex);
  // });

}


angular.module('mainapp').directive('categorySelect', categorySelect);
categorySelect.$inject = ['$document', '$animate', '$templateRequest',
  '$compile', '$parse', '$timeout'];
function categorySelect($document, $animate, $templateRequest, $compile, $parse, $timeout) {

  return {
    restrict: 'E',
    replace: true,
    require: ['?ngModel', 'categorySelect'],
    scope: {
      options: '=',
      // onSelect: "&",
    },
    templateUrl: 'app/comp/select/category_select.html',
    controller: 'categorySelectCtrl',
    controllerAs: '$select',

    link: function($scope, $element, $attrs, ctrls) {
      let ngModel = ctrls[0];
      let $select = ctrls[1];

      $scope.$watch('options', function(options){
        if (!options) {
          return;
        }

        $scope.optionItems = parseCateogoryOptions($scope.options);
      });

      $scope.onSelectExpr = $parse($attrs.onSelect);

      $scope.setSelect = function() {
        let selected = $scope.optionItems[$scope.activeIndex].join('/');
        $scope.onSelectExpr($scope.$parent, {'$selected': selected});
      }

      $scope.focusInput = $element.find('input.search-input').first();

      $scope.focusInput.focus();

      $scope.highlight = function(index) {
        $scope.activeIndex = index;
      }

      $element.on('keydown', function(e) {
        console.log('k', e.which);

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)) {
          return;
        }

        _handleKeyEvents(e);

        $scope.$digest();
      });

      $scope.focusInput.on("keydown", function(e) { // 当按键按下

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)) {
          return;
        }

        _handleKeyEvents(e);

        $scope.$digest();
      });

      function _handleKeyEvents(e) {
        if ([KEY.DOWN, KEY.UP, KEY.ENTER].indexOf(e.which) >= 0) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (e.which == KEY.DOWN) {
          $scope.$evalAsync(function(){
            if ($scope.activeIndex < $scope.optionItems.length - 1) {
              $scope.activeIndex++;
            } else {
              $scope.activeIndex = 0;
            }
          });

        } else if (e.which == KEY.UP) {

          $scope.$evalAsync(function(){
            if ($scope.activeIndex > 0) {
              $scope.activeIndex--;
            } else {
              $scope.activeIndex = $scope.optionItems.length - 1;
            }
          });
        } else if (e.which == KEY.ENTER) {
          $scope.$evalAsync(function(){
            $scope.setSelect();
          });
        }
      }

      $scope.focusInput.on("keyup input", function(e) {

        // 键抬起或着input发生输入
        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)
            || e.which === KEY.ESC || e.which == KEY.ENTER
            || e.which === KEY.BACKSPACE) {
          return;
        }

        $scope.searchText = $scope.focusInput.val();
        $scope.$digest();
      });
    }
  };
}


/** 将一组[a/1, b/2]转换成 [[a,null], [a,1], [b, null], [b, 1]]
 */
function parseCateogoryOptions(options) {

  let optionItems = [];

  let cat1;

  for (item of options.sort().map(s => s.split('/', 2))) {
    if (cat1 != item[0]) {
      if (item.length > 1 && item[1] && item[1].length > 0) {
        // 如果分类A/1, 接着就是B/1，而不是标准的 A/1, B, B/1
        optionItems.push([item[0], '']);
      }

      cat1 = item[0];
    }

    optionItems.push([item[0], item[1]]);
  }

  return optionItems;
}
