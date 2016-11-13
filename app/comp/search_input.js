(function() {
  "use strict";
  var app = angular.module('mainapp');

  /** 键盘失去焦点且按下Enter键更新modelValue */
  app.directive("updateOnEnterPressed", updateOnEnterPressed);
  updateOnEnterPressed.$inject = [];
  function updateOnEnterPressed() {
    return {
      restrict: "A",
      require: "ngModel",
      link: link,
    };
    function link($scope, element, attrs, ngModelCtrl) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          $scope.$apply(function() {
            ngModelCtrl.$commitViewValue();
          })
        }
      })
    }
  }

  /** <div ng-model="var1" on-enter-pressed="somefunc(var1)"  */
  app.directive('onEnterPressed', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.onEnterPressed);
          });
          event.preventDefault();
        }
      });
    };
  });

  /** 搜索框， 录入搜索关键字会激活 on-search="search($searchtext)" */
  app.directive("searchInput", searchInputDirective);
  searchInputDirective.$inject = ['$timeout'];
  function searchInputDirective($timeout) {
    return {
      restrict: "E",
      replace: true,
      templateUrl: 'app/comp/search_input.html',
      link: link,
    };

    function link($scope, element, attrs, ngModelCtrl) {
      $scope.$searchtext = '';

      if (angular.isString(attrs.placeholder)) {
        $scope.placeholder = attrs.placeholder;
      } else {
        $scope.placeholder = "输入搜索...";
      }

      $scope.clearText = function() {
        $scope.$searchtext = "";
        $scope.commitText();
      }

      $scope.commitText = function() {
        $scope.$eval(attrs.onSearch);
      }

      $scope.$watch('$searchtext', function(newVal, oldVal) {
        $scope.commitText();
      });
    }
  }
})();
