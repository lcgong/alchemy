import "./select.css!"

import {KEY} from "./keychars";


/** 数据：
  categories : {
    category_string : {
      backgroudColor: '#fff',
      color: '#fff',
      pinyinAliases: [], // 为搜索拼音化,  ['fl1/fl2', 'fenlei1/fenlei2']
      taggedTime: '2016... Timestamp', // 最近贴此条的时间
    }
  }
  */

import {compareLabelItem} from "./badge";

angular.module('mainapp').directive('categorySelect', categorySelect);
categorySelect.$inject = ['$compile', '$parse', '$timeout'];
function categorySelect($compile, $parse, $timeout) {

  return {
    restrict: 'E',
    replace: true,
    require: ['?ngModel', 'categorySelect'],
    scope: {},
    // scope: {
    //   // options: '=',
    //   depth: '=?', // 分类的层数，1 或 2
    //   // onSelect: "&",
    // },
    templateUrl: 'app/category/select.html',
    controller: 'categorySelectCtrl',
    controllerAs: '$select',

    link: function($scope, $element, $attrs, ctrls) {
      let ngModel = ctrls[0];
      let $select = ctrls[1];

      $scope.$parent.$watch($attrs.depth, depth => {
        $scope.depth = depth;
      })

      $scope.$parent.$watch($attrs.options, categorys => {
        $scope.origCategoryItems = convertToList(categorys);
        $scope.categoryItems = $scope.origCategoryItems;
        // console.log($scope.categoryItems);
      });

      $scope.onSelectExpr = $parse($attrs.onSelect);
      $scope.setSelect = function() {
        // console.log(333, $scope.categoryItems[$scope.activeIndex])
        let selected = $scope.categoryItems[$scope.activeIndex][0];
        $scope.onSelectExpr($scope.$parent, {'$selected': selected});
      }

      $scope.$watch('searchText', search => {
        if (!search) {
          $scope.categoryItems = $scope.origCategoryItems;
          return;
        }

        $scope.categoryItems = searchFilter($scope.origCategoryItems, search);
      });

      $scope.focusInput = $element.find('input.search-input').first();

      $scope.focusInput.focus();

      $scope.highlight = function(index) {
        $scope.activeIndex = index;
      }

      $element.on('keydown', function(e) {
        // console.log('k', e.which);

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
            if ($scope.activeIndex < $scope.categoryItems.length - 1) {
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
              $scope.activeIndex = $scope.categoryItems.length - 1;
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

angular.module('mainapp').controller('categorySelectCtrl', categorySelectCtrl);
categorySelectCtrl.$inject = ['$scope', '$element', '$attrs'];
function categorySelectCtrl($scope, $element, $attrs) {

  let $select = this;

  $scope.categoryItems = [];

  // $scope.$watch('searchText', function(searchText) {
  //   console.log(searchText);
  // });
  // $scope.$watch('activeIndex', function(activeIndex) {
  //   console.log(activeIndex);
  // });

}


/*
  将 {cat_name : {cat_props},  }
  [ [{ cat_props, ... }, cat_name_level1, cat_name_level2], ... ] */
function convertToList(categories) {
  if (!categories) {
    return [];
  }

  let items = [];

  let cat1;

  for (label of Object.keys(categories).sort()) {
    let labelParts = label.split('/', 2);

    if (cat1 != labelParts[0]) {
      if (labelParts.length > 1 && labelParts[1] && labelParts[1].length > 0) {
        // 如果分类A/1, 接着就是B/1，而不是标准的 A/1, B, B/1

        items.push([{label: labelParts[0]}, labelParts[0], '']);
      }

      cat1 = labelParts[0];
    }

    let props = categories[label];
    if (!props) {
      props = {};
    }
    props.label = label;

    items.push([props, labelParts[0], labelParts[1]]);
  }

  items.sort(compareLabelItem);
  return items;
}


function searchFilter(origItems, searchText) {
  searchText = searchText.toLowerCase();

  let items = [];
  for (item of origItems) {
    let props = item[0];
    if (props.label.toLowerCase().includes(searchText)) {
      items.push(item);
      continue;
    }

    if (props.pinyinAliases && props.pinyinAliases) {
      let found = false;
      for (pinyin of props.pinyinAliases) {
        if (pinyin.toLowerCase().includes(searchText)) {
          found = true;
          break;
        }
      }
      if (found) {
        items.push(item);
        continue;
      }
    }
  }

  return items;
}
