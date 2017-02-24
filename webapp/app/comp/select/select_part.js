(function() {
  "use strict";

  var app = angular.module('mainapp');



  /**
    <select-part
      editable="'true'"
      ng-model="..."
      options="partList"
      off-options="offOptionList"
      as-object
      placeholder="">
    </select-part>
    缺省值是航材序号，as-object则是航材对象（包括详细详细信息）
    可用选项中除了已选中的不能包含off-options选项里的
  */
  app.directive("selectPart", selectPart);
  selectPart.$inject = ['$q', '$filter', 'PartModel', '$timeout'];
  function selectPart($q, $filter, PartModel, $timeout) {
    return {
      restrict: "E",
      require: "ngModel",
      replace: true,
      scope: {
        options: '=',
        offOptions: '=?',
        editable: '=?',
        placeholder: '@?'
      },
      templateUrl: 'app/comp/select/select_part.html',
      link: selectPartLinkFunc,
      controller: 'selectPartCtrl',
      controllerAs: 'ctrl',
    };

    function selectPartLinkFunc($scope, element, attrs, ngModelCtrl) {

      if (angular.isString(attrs.style)) {
        $scope.cssStyle = attrs.style;
      } else {
        $scope.cssStyle = '';
      }

      $scope.$watch('displayed', function(newValue, oldValue, scope) {

        ngModelCtrl.$render();
      });

      ngModelCtrl.$render = function() {

        if (angular.isUndefined(ngModelCtrl.$modelValue)) {
          $scope.model.selected = undefined;
          return;
        }

        // 在设置初始值为对象时，或许仅指定了序号，因此需根据序号找到其对象
        var part_sn;
        if ($scope.asObject) {
          part_sn = ngModelCtrl.$modelValue.part_sn;
        } else {
          part_sn = ngModelCtrl.$modelValue;
        }

        var selected;
        selected = $scope.options.find(function(item) {
          return item.part_sn == part_sn ? true : false;
        });

        if ($scope.asObject) {
          // 在对象模式下，没找到序号所对应的对象，保留原设置的对象
          if (angular.isUndefined(selected))
            selected = ngModelCtrl.$modelValue;
        } else {
          if (angular.isUndefined(selected)) {
            // 没有从候选中找到，使用原来的或构造新的
            if (angular.isDefined($scope.model.selected)
              && $scope.model.selected.part_sn == part_sn) {

              selected = $scope.model.selected;
            } else {
              selected = {
                part_sn: part_sn,
                title: '#' + part_sn + ', 查找中...'
              };
            }
          }
        }

        $scope.model.selected = selected;
      };

      $scope.$watch('model.selected', function(newValue, oldValue, scope) {
        if ($scope.asObject) {
          ngModelCtrl.$setViewValue(newValue);
        } else {
          if (angular.isUndefined(newValue)) {
            ngModelCtrl.$setViewValue(newValue);
          } else {
            ngModelCtrl.$setViewValue(newValue.part_sn);
          }
        }
      });

    }
  }


  app.controller('selectPartCtrl', selectPartCtrl)
  selectPartCtrl.$inject = ['$scope', '$filter'];
  function selectPartCtrl($scope, $filter) {
    console.log('selectPartCtrl: created');

    $scope.displayed = [];
    $scope.model = {};

    if (angular.isUndefined($scope.editable)) { // default value
      $scope.editable = true;
    }

    if (angular.isUndefined($scope.offOptions)) {
      $scope.offOptions = [];
    }

    $scope.asObject = false;

    var search = $filter('searchIn');

    $scope.refresh = function($select) {
      var searchtext = $select.search;

      var filtered = search($scope.displayed, ['part_no', 'title'], searchtext);
      if (filtered.length > 100) { // 当列表太多时截断
        filtered = [{
          tooMany: filtered.length
        }];
      }

      $select.items = filtered;
    }

    $scope.$watch('options', function(newVal, oldVal) {
      if (!angular.isArray($scope.options)) {
        $scope.options = [];
      }

      refreshDisplayed();
    });

    $scope.$watch('offOptions', function(newVal, oldVal) {
      if (!angular.isArray($scope.offOptions)) {
        $scope.offOptions = [];
      }

      refreshDisplayed();
    });

    var refreshDisplayed = function() {
      var offPartSn;
      if ($scope.asObject) {
        offPartSn = $scope.offOptions.map(function(item) {
          return item.part_sn
        });
      } else {
        offPartSn = $scope.offOptions;
      }
      var selectedPartSn;

      if (angular.isObject($scope.model.selected))
        selectedPartSn = $scope.model.selected.part_sn;

      if (angular.isArray($scope.options) && offPartSn.length > 0) {
        $scope.displayed = $scope.options.filter(function(item) {
          if (item.part_sn == selectedPartSn)
            return true; // 要显示已选中的

          for (var i = 0, len = offPartSn.length; i < len; i++) {
            if (offPartSn[i] == item.part_sn)
              return false; // 不用显示的
          }

          return true;
        });
      } else {
        $scope.displayed = $scope.options;
      }

      // console.log('displayed: %o', $scope.displayed);
    };
  }

})();
