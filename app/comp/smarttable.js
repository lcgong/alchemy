(function() {
  'use strict';
  var app = angular.module('mainapp');

  /**
   * @desc 表格内选择记录的checkbox
   * @example <div acme-sales-customer-info></div>
   * <table st-table="" cb-select="selected">
   *   <tr ng-repeat="row in items">
   *     <td cb-checkbox="row"></td>
   */
  app.controller('STRowCheckboxCtrl', STRowCheckboxCtrl);
  STRowCheckboxCtrl.$inject = ['$scope', '$parse', '$attrs'];

  function STRowCheckboxCtrl($scope, $parse, $attrs) {

    var selectGetter = $parse($attrs.cbSelect);

    this.select = function(row, flag) {

      var selectedRows = selectGetter($scope);
      var index = selectedRows.indexOf(row);

      if (flag == true) {
        if (index == -1) {
          selectedRows.push(row);
        }
      } else {
        if (index >= 0) {
          selectedRows.splice(index, 1);
        }
      }
    }
  }


  /** bind the 'pipe' function of smart-table.
   */
  angular.module('mainapp').directive('cbBindPipe', cbBindPipeDirective);
  cbBindPipeDirective.$inject = ['$parse'];

  function cbBindPipeDirective($parse) {
    return {
      restrict: 'A',
      require: 'stTable',
      link: function($scope, element, $attrs, ctrls) {
        var pipeGetter = $parse($attrs.cbBindPipe);
        var pipeSetter = pipeGetter.assign;

        pipeSetter($scope, ctrls.pipe);
      }
    };
  }


  angular.module('mainapp').directive('cbSelect', cbSelectDirective);

  function cbSelectDirective() {
    return {
      restrict: 'A',
      require: 'stTable',
      controller: 'STRowCheckboxCtrl'
    };
  }

  angular.module('mainapp').directive('cbPageNo', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<input type="text" ng-model="inputPage"' + ' ng-change="selectPage(inputPage)">',
      link: function(scope, element, attrs) {
        scope.$watch('currentPage', function(c) {
          scope.inputPage = c;
        });
      }
    }
  });

  angular.module('mainapp').directive('cbCheckbox', cbCheckboxDirective);

  function cbCheckboxDirective() {
    return {
      require: ['^stTable', '^cbSelect'],
      restrict: 'A',
      template: '<input type="checkbox"/>',
      scope: {
        row: '=cbCheckbox',
      },
      link: function($scope, element, attr, ctrls) {
        var stTableCtrl = ctrls[0];
        var cbSelectCtrl = ctrls[1];

        element.bind('change', function(evt) {
          $scope.$apply(function() {
            stTableCtrl.select($scope.row, 'multiple');
          });
        });

        $scope.$watch('row.isSelected', function(newValue, oldValue) {
          if (newValue === true) {
            element.parent().addClass('st-selected');
            cbSelectCtrl.select($scope.row, true);

          } else {
            element.parent().removeClass('st-selected');
            cbSelectCtrl.select($scope.row, false);

          }
        });
      }
    };
  }

})();
