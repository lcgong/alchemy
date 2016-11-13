(function() {
  "use strict";

  var app = angular.module('mainapp');

  app.factory('PeriodNo', PeriodNo);
  PeriodNo.$inject = [];
  function PeriodNo() {

    return {
      roll: period_roll,
      rollObj: period_object_roll,
      type: period_type,
      year: period_year,
      snum: period_snum,
      encode: period_encode,
      decode: period_decode,
      new_month_period: new_month_period
    }
  }

  function period_type(period_no) {
    return Math.trunc(period_no / 10000000);
  }

  function period_year(period_no) {
    return Math.trunc((period_no % 10000000) / 1000);
  }

  function period_snum(period_no) {
    return Math.trunc(period_no % 1000);
  }

  function period_roll(period_no, num) {
    // period_no : tyyyynnn
    var type = Math.trunc(period_no / 10000000);
    var year = Math.trunc((period_no % 10000000) / 1000);
    var snum = Math.trunc(period_no % 1000);

    var mod;
    if (type == 2) {
      snum += num;
      year += Math.trunc(snum / 12);
      snum = (snum - 1) % 12 + 1;
    } else if (type == 3) {
      snum += num;
      year += Math.trunc(snum / 4);
      snum = (snum - 1) % 4 + 1;
    } else if (type == 4) {
      year += 1;
    } else {
      throw "unknown period: " + period_no;
    }

    return type * 10000000 + year * 1000 + snum;
  }

  function period_object_roll(period, num) {
    // period {type: , year:, snum:, }

    var total;
    if (period.type == 2) {
      total = period.year * 12 + (period.snum - 1) + num;
      period.year = Math.trunc(total / 12);
      period.snum = total % 12 + 1

    } else if (period.type == 3) {
      total = period.year * 4 + (period.snum - 1) + num;
      period.year = Math.trunc(total / 4);
      period.snum = total % 4 + 1

    } else if (period.type == 4) {
      period.year += num;

    } else {
      throw "unknown period: " + period.type;
    }

    return period;
  }

  function period_encode(period, num) {
    // period {type: , year:, snum:, }
    var type = period.type;
    var year = period.year;
    var snum = period.snum;

    if (!angular.isNumber(snum)) {
      snum = 0;
    }

    return type * 10000000 + year * 1000 + snum;
  }

  function period_decode(period) {
    // period_no : tyyyynnn
    var type = Math.trunc(period / 10000000);
    var year = Math.trunc((period % 10000000) / 1000);
    var snum = Math.trunc(period % 1000);

    return {
      type: type,
      year: year,
      snum: snum
    }
  }

  function new_month_period(d) {
    return 20000000 + d.getFullYear() * 1000 + d.getMonth() + 1;
  }

  // -------------------------------------------------------------------------
  app.directive("inputPeriodNo", inputPeriodNoDirective);
  inputPeriodNoDirective.$inject = ['$timeout', 'PeriodNo'];
  function inputPeriodNoDirective($timeout, PeriodNo) {
    return {
      restrict: "A",
      require: "ngModel",
      link: link
    };


    function link($scope, element, attrs, ngModelCtrl) {

      ngModelCtrl.$render = function() {
        element.val(formatPeriodNo(ngModelCtrl.$modelValue));
      }

      $scope.$watchCollection(function() {
        return ngModelCtrl.$modelValue
      }, function(newVal, oldVal) {
        ngModelCtrl.$render();
      }, true);

      ngModelCtrl.$parsers.unshift(function(value) {
        var periodType;
        if (angular.isDefined(ngModelCtrl.$modelValue)) {
          periodType = ngModelCtrl.$modelValue.type;
        }

        if (angular.isNumber(value)) {
          return '' + value;
        }
        var matched = /(\d{4})[^\d]*([0,1]?\d)?/.exec(value);
        if (matched == null) {
          // ngModelCtrl.$setValidity('periodNo', false);
          return ngModelCtrl.$modelValue;
        }

        var year = parseInt(matched[1]);
        if (isNaN(year)) {
          // ngModelCtrl.$setValidity('periodNo', false);
          return ngModelCtrl.$modelValue;
        }

        var snum = null;
        if (angular.isDefined(matched[2])) {
          snum = parseInt(matched[2]);
        }

        return {
          type: periodType,
          year: year,
          snum: snum
        };
      });
    }

    function formatPeriodNo(value) {
      var s = '';

      if (angular.isNumber(value.year)) {
        s += value.year;
      }

      if (angular.isNumber(value.snum) && value.snum > 0) {
        s += ' . ' + value.snum;
      }
      return s;
    }
  }

  //--------------------------------------------------------------------------
  app.directive("selectPeriodNo", selectPeriodNo);
  selectPeriodNo.$inject = ['$timeout', 'PeriodNo'];
  function selectPeriodNo($timeout, PeriodNo) {
    return {
      restrict: "EA",
      require: "ngModel",
      replace: true,
      scope: {
        termType: '@?', // term-type, M/Q/Y
      },
      templateUrl: 'app/comp/select/period_select.html',
      link: link,
      controller: 'selectPeriodNoCtrl',
      controllerAs: 'ctrl',
    };

    function link($scope, element, attrs, ngModelCtrl) {

      var now = new Date();

      $scope.period_no = {
        type: 2,
        year: now.getFullYear(),
        snum: now.getMonth() + 1
      };

      $scope.options = [];
      var allTermTypes = [{
        type: 2,
        id: 'M',
        title: '月度'
      }, {
        type: 3,
        id: 'Q',
        title: '季度'
      }, {
        type: 4,
        id: 'Y',
        title: '年度'
      }];

      if (angular.isString(attrs.showMqy) && attrs.showMqy == 'false') {
        // 是否显示MQY按钮
        $scope.showMqy = false;
      } else {
        $scope.showMqy = true;
      }

      if (angular.isString(attrs.termType)) {
        if (/M/i.exec(attrs.termType) != null) {
          $scope.options.push(allTermTypes[0]);
        }

        if (/Q/i.exec(attrs.termType) != null) {
          $scope.options.push(allTermTypes[1]);
        }

        if (/Y/i.exec(attrs.termType) != null) {
          $scope.options.push(allTermTypes[2]);
        }

        if ($scope.options.length == 0) {
          $scope.options.push(allTermTypes[0]);
        }

      } else {
        $scope.options = [].cancat(allTermTypes);
      }

      $scope.options.forEach(function(x, i) {
        x.idx = i;
      });

      $scope.mqy = $scope.options[0];

      ngModelCtrl.$render = function() {
        if (angular.isUndefined(ngModelCtrl.$modelValue)) {
          ngModelCtrl.$setViewValue(PeriodNo.encode($scope.period_no));
          return;
        }

        $scope.period_no = PeriodNo.decode(ngModelCtrl.$modelValue);
      }

      $scope.$watch('period_no', function(newVal, oldVal) {
        if (angular.isUndefined(newVal)) {
          return undefined;
        }

        ngModelCtrl.$setViewValue(PeriodNo.encode(newVal));
      }, true);

      $scope.up = function() {
        PeriodNo.rollObj($scope.period_no, 1);
      }

      $scope.down = function() {
        PeriodNo.rollObj($scope.period_no, -1);
      }

      $scope.toggleMQY = function() {
        var newidx = ($scope.mqy.idx + 1) % $scope.options.length;
        $scope.mqy = $scope.options[newidx];

        $scope.period_no.type = $scope.mqy.type;
        if ($scope.mqy.type == 4) { // 年度
          $scope.period_no.snum = 0;
        } else {
          $scope.period_no.snum = 1;
        }

      }
    }
  }

  app.controller('selectPeriodNoCtrl', selectPeriodNoCtrl)
  selectPeriodNoCtrl.$inject = ['$scope', 'PeriodNo'];
  function selectPeriodNoCtrl($scope, PeriodNo) {
    var ctrl = this;

  }

})();
