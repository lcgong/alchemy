(function() {
  "use strict";

  var app = angular.module('mainapp');

  app.directive("selectHostMulti", selectHostMulti);
  selectHostMulti.$inject = ['$templateCache', '$q', '$filter',
    'HostModel', '$timeout'];
  function selectHostMulti($templateCache, $q, $filter, HostModel, $timeout) {
    return {
      restrict: "EA",
      require: "ngModel",
      replace: true,
      scope: {
        options: "=",
        returnWay: "@?" // object; host_sn
      },
      templateUrl: 'app/comp/select/select_host_multi.html',
      link: selectCodeLinkFunc
    };

    function selectCodeLinkFunc($scope, element, attrs, ngModelCtrl) {

      var ctrl = this;

      $scope.model = {
        selected: []
      };

      if (!(angular.isString($scope.returnWay)
        && ($scope.returnWay == 'object' || $scope.returnWay == 'host_sn'))) {
        $scope.returnWay = 'object';
      }

      var search = $filter('searchIn');
      var searchables = ['host_no', 'title'];

      $scope.$watch('options', function(newVal, oldVal) {
        ngModelCtrl.$render();
      });

      $scope.refresh = function($select) {
        var searchtext = $select.search;

        var filtered = search($scope.options, searchables, searchtext);
        if (filtered.length > 100) {
          filtered = [{
            tooMany: filtered.length
          }];
        }

        $select.items = filtered;
      }

      ngModelCtrl.$render = function() {
        var selected = ngModelCtrl.$modelValue;
        if (!angular.isArray(selected)) {
          return;
        }

        var selectedItems = [];
        if ($scope.returnWay == 'object') {
          for (var i = 0, leni = selected.length; i < leni; i++) {
            var host = selected[i];

            var matched = null;
            for (var j = 0, lenj = $scope.options.length; j < lenj; j++) {
              var item = $scope.options[j];
              if (item.host_sn == host.host_sn) {
                matched = item;
                break;
              }
            }

            if (matched !== null) {
              selectedItems.push(matched);
            } else {
              selectedItems.push({
                host_sn: host
              });
            }
          }

        } else if ($scope.returnWay == 'host_sn') {
          for (var i = 0, leni = selected.length; i < leni; i++) {
            var host_sn = selected[i];

            var matched = null;
            for (var j = 0, lenj = $scope.options.length; j < lenj; j++) {
              var item = $scope.options[j];
              if (item.host_sn == host_sn) {
                matched = item;
                break;
              }
            }

            if (matched !== null) {
              selectedItems.push(matched);
            } else {
              selectedItems.push({
                host_sn: host_sn
              });
            }
          }
        }


        $scope.model.selected = selectedItems;
      };

      $scope.$watch('model.selected', function(newValue, oldValue, scope) {
        if (angular.isUndefined(newValue)) {
          ngModelCtrl.$setViewValue(newValue);
        }

        var result;
        if ($scope.returnWay == 'object') {
          result = newValue;
        } else if ($scope.returnWay == 'host_sn') {
          result = newValue.map(function(obj) {
            return obj.host_sn;
          });
        }

        ngModelCtrl.$setViewValue(result);
      });
    }
  }

})();
