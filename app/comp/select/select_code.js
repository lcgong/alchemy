(function() {

  'use strict';

  var app = angular.module('mainapp');

  app.directive("selectCode", selectCode);
  selectCode.$inject = ['$templateCache', '$q', '$filter',
    'CodeManager', '$timeout'];
  function selectCode($templateCache, $q, $filter, CodeManager, $timeout) {
    return {
      restrict: "EA",
      require: "ngModel",
      replace: true,
      scope: {
        editable: '=?',
        dict: '@?', // 字典名字
        searchable: '@?', //那些字段可以用来搜索
        result: '@?', // 返回是对象，还是具体某个字段
        newOneField: '@?', // 允许添加新的内容的字段
        titleField: '@?', // 作为条目内容显示的字段
        codeField: '@?', // 按代码样式显示的字段
        clearButton: '@?',
        placeholder: '@?'
      },
      templateUrl: 'app/comp/select/select_code.html',
      link: selectCodeLinkFunc
    };

    function selectCodeLinkFunc($scope, element, attrs, ngModelCtrl) {

      $scope.model = {};

      var dict_name = $scope.dict;

      if (angular.isUndefined($scope.editable)) {
        $scope.editable = true;
      }

      var dict_config = CodeManager.getConfiguration(dict_name);
      var searchable = dict_config.searchable;

      var resultWay;
      if (angular.isUndefined($scope.result)) {
        resultWay = 'object';
      } else {
        resultWay = $scope.result;
      }

      if (angular.isUndefined($scope.clearButton)) {
        $scope.model.clearButton = false;
      } else {
        if ($scope.clearButton == 'false') {
          $scope.model.clearButton = false;
        } else {
          $scope.model.clearButton = true;
        }
      }

      var idField = dict_config.code_field;
      var codeField = $scope.codeField;
      var titleField = $scope.titleField;
      var newOneField = $scope.newOneField;

      if (angular.isUndefined(codeField) && angular.isUndefined(titleField)) {
        codeField = dict_config.code_field;
        titleField = dict_config.title_field;
      }

      $scope.model.idField = idField;
      $scope.model.codeField = codeField;
      $scope.model.titleField = titleField;
      $scope.model.newOneField = $scope.newOneField;

      $scope.codelist = [];

      $scope.minLengthOfSearchText = 3;

      $timeout(function() {
        $q.when(CodeManager.getCodeList(dict_name, false))
          .then(function(codes) {
            $scope.codelist = angular.copy(codes);
            if ($scope.codelist.length < 50) {
              $scope.minLengthOfSearchText = 0;
            }

            ngModelCtrl.$render();
            return codes;
          });

      }, 0);

      var normlize = CodeManager.normalizer($scope.dict);
      var search = $filter('searchIn');

      $scope.refresh = function($select) {
        // console.log('refresh: ', $select.search);
        var searchtext = $select.search;
        // console.log(121, searchtext.length, $scope.minLengthOfSearchText);
        if (searchtext.length < $scope.minLengthOfSearchText) {
          $select.items = [];
          return;
        }
        // console.log(111, searchtext.length);

        var codes = search($scope.codelist, searchable, searchtext);


        if (newOneField) { // 允许填写不存在的对象
          var thelast = $scope.codelist[$scope.codelist.length - 1];
          if (thelast['__select_state__'] != 'N') {
            var thelast = undefined; // 只保留一个自己创建的
          }

          if (codes.length <= 1) {
            if (codes.length == 0) { // 添加新数据
              if (!thelast) {
                var newitem = {};
                newitem['__select_state__'] = 'N';
                newitem[newOneField] = searchtext;
                codes = [newitem];
                $scope.codelist.push(newitem);
              } else {
                // 已经存在一个自己添加的，只是没有匹配到原来那个
                newitem = thelast;
                newitem[newOneField] = searchtext;
                codes = [newitem];
              }
            } else { // 新记录已经存在
              if (codes[0]['__select_state__'] == 'N') {
                codes[0][titleField] = searchtext;
              }
            }
          }
        }

        $select.items = codes;
        // $scope.codelist = codes;

        // console.log('refresh: items=', codes);
      }

      ngModelCtrl.$render = function() {
        var value = ngModelCtrl.$modelValue;

        if (angular.isUndefined(value)) {
          $scope.model.selected = undefined;
          return;
        }

        var matched = undefined;
        if (resultWay == 'object') {
          for (var i = 0, len = $scope.codelist.length; i < len; i++) {
            var item = $scope.codelist[i];
            if (item[idField] == value[idField]) {
              matched = item;
              break;
            }
          }
        } else {
          for (var i = 0, len = $scope.codelist.length; i < len; i++) {
            var item = $scope.codelist[i];
            if (item[resultWay] == value) {
              matched = item;
              break;
            }
          }
        }

        if (matched == undefined) {
          if (resultWay == 'object') {
            matched = value;
          } else {
            matched = {};
            matched[resultWay] = value;
          }
        }

        $scope.model.selected = matched;
        // console.log('select-code: render matched2: ', $scope.codelist, matched);

      };
      //
      // $scope.$watch('$select.selected', function(newValue, oldValue, scope) {
      //   console.log(333, newValue, oldValue, scope);
      // });

      $scope.$watch('model.selected', function(newValue, oldValue, scope) {
        // console.log(444, newValue)
        if (angular.isUndefined(newValue)) {
          ngModelCtrl.$setViewValue(newValue);
          return;
        }

        // 在ui-select选择时(即他的ngModel)，更新select-user的ngModel
        var newModelValue;
        if (resultWay == 'object') {
          newModelValue = newValue;
        } else {
          newModelValue = newValue[resultWay];
        }

        if (ngModelCtrl.$modelValue != newModelValue) {
          // console.log('set new model value', newModelValue);
          ngModelCtrl.$setViewValue(newModelValue);
        }
      });

      $scope.clear = clear; // 清除选择的内容
      function clear($event, $select) {
        $event.stopPropagation();

        $select.selected = undefined;
        $select.search = undefined;

        // $select.activate(); //获得焦点，打开下拉框
      }
    }
  }

  angular.module('mainapp').directive('convertToNumber', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
          return parseInt(val, 10);
        });
        ngModel.$formatters.push(function(val) {
          return '' + val;
        });
      }
    };
  });


  // item-changed='item.field' on-item-changed='func(item.field)'
  angular.module('mainapp').directive('itemChanged', ['$parse',
    function($parse) {

      return {
        link: function($scope, $element, $attrs, ctrls) {
          var itemChanged = $attrs.itemChanged;
          var onItemChangedGetter = $parse($attrs.onItemChanged);
          $scope.$watch(itemChanged, function(newValue, oldValue) {
            return onItemChangedGetter($scope, {
              newValue: newValue,
              oldValue: oldValue
            });
          });
        }
      };
  }]);
})();
