(function() {
  'use strict';

  angular.module('mainapp').directive("uddBtn", function($q) {
    return {
      restrict: "E",
      replace: true,
      require: "ngModel",
      scope: {
        index: '&'
      },
      templateUrl: 'app/comp/udd-btn.html',
      link: link
    };

    function link($scope, element, $attrs, ngModelCtrl) {
      var blankRow = $attrs['blankRow'];
      if (angular.isString(blankRow)) {
        blankRow = (blankRow.length == 0) ? 'tail' : blankRow.toLowerCase();
      }

      ngModelCtrl.$render = function() {
        $scope.items = ngModelCtrl.$modelValue;
      }

      var swap = function(i, j) {
        // $timeout(function(){
        var t = $scope.items[i];
        $scope.items[i] = $scope.items[j];
        $scope.items[j] = t;
        // console.log('swap: ', i, j , $scope.items()[i], $scope.items()[j])
        // }, 0);
      }

      $scope.up = function() {
        if (!$scope.isHead()) {
          swap($scope.index() - 1, $scope.index());
          ngModelCtrl.$setDirty();
        }


      };

      $scope.down = function() {
        if (!$scope.isTail()) {
          swap($scope.index(), $scope.index() + 1);
          ngModelCtrl.$setDirty();
        }
      };

      $scope.del = function() {
        $scope.items.splice($scope.index(), 1);
        ngModelCtrl.$setDirty();
      };

      $scope.isHead = function() {
        return $scope.index() == 0;
      };

      $scope.isTail = function() {
        if (angular.isString(blankRow) && blankRow == 'tail') {
          return $scope.items.length <= $scope.index() + 2; // 留出最后一行
        } else {
          return $scope.items.length <= $scope.index() + 1;
        }
      };

      $scope.isBlankRow = function() {
        // console.log('blank ', $scope.items.length <= $scope.index + 1, $scope.index);
        if (angular.isString(blankRow) && blankRow == 'tail') {
          return $scope.items.length <= $scope.index() + 1;
        } else {
          return false;
        }
      }
    }
  });
})();
