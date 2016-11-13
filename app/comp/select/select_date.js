(function() {
  'use strict';

  var app = angular.module('mainapp');

  app.constant('datepickerConfig', {
    formatDay: 'dd',
    formatMonth: 'MMMM',
    formatYear: 'yyyy',
    formatDayHeader: 'EEE',
    formatDayTitle: 'yyyy年 MMMM',
    formatMonthTitle: 'yyyy',
    datepickerMode: 'day',
    minMode: 'day',
    maxMode: 'year',
    showWeeks: true,
    startingDay: 1,
    yearRange: 20,
    minDate: null,
    maxDate: null
  })

  app.directive("selectDate", selecctDateDirective);
  selecctDateDirective.$inject = ['$timeout', '$filter', 'uibDateParser'];
  function selecctDateDirective($timeout, $filter, uibDateParser) {
    return {
      restrict: "EA",
      require: "ngModel",
      replace: true,
      scope: {
        editable: '=?'
      },
      templateUrl: 'app/comp/select/select_date.html',
      link: function($scope, element, attrs, ctrl) {

        $scope.model = {
          opened: false,
          date: undefined
        };

        if (!angular.isDefined($scope.editable)) {
          $scope.editable = true;
        }

        $scope.today = function() {
          $scope.model.date = new Date();
        };

        // $scope.today();

        $scope.clear = function() {
          $scope.model.date = null;
        };

        // Disable weekend selection
        $scope.disabled = function(date, mode) {
          return false;
          // return ( mode === 'day' && ( date.getDay() === 0
          // || date.getDay() === 6 ) );
        };

        $scope.open = function() {
          $scope.opened = !$scope.opened;
        };

        $scope.dateOptions = {
          formatDayTitle: 'yyyy MMMM',
          formatYear: 'yy',
          startingDay: 1
        };

        var dateFormat = $filter('date');

        $scope.$watch('model.date', function(newValue, oldValue, scope) {

          var value = dateFormat(newValue, 'yyyy-MM-dd');
          ctrl.$setViewValue(value);
        });

        ctrl.$render = function() {
          var value = ctrl.$modelValue;

          if (angular.isString(value)) {
            $scope.model.date = new Date(value);
          } else if (angular.isUndefined(value) || value === null) {
            $scope.model.date = null;
          } else if (value instanceof Date) {
            $scope.model.date = value;
          } else {
            console.warn("select-date: the value type is unkown, ", value);
          }
        };
      }
    }
  }


})();
