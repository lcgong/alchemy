(function() {
  'use strict';
  var app = angular.module('mainapp');
  //-------------------------------------------------------------------------

  app.directive('d3Chart', ['$parse', '$window', '$timeout', 'd3', function($parse, $window, $timeout, d3) {
    return {
      restrict: 'EA',
      replace: true,
      template: '<svg style="width:100%;"></svg>',
      scope: {
        data: '=',
      },
      link: function($scope, $element, $attrs) {

        var d3ChartGetter = $parse($attrs.d3Chart);
        var chart = d3ChartGetter($scope.$parent);

        var objectequality;
        if ($attrs.objectequality === undefined) {
          objectequality = false;
        } else {
          objectequality = $attrs.objectequality === 'true';
        }

        if (angular.isDefined(chart)) {
          nv.utils.windowResize(chart.update);
        }

        nv.addGraph({
          generate: function() {
            return chart;
          },
          callback: null
        });

        $scope.$watch('data', function(data) {
          render();
        }, objectequality);

        $window.addEventListener('resize', function(event) {
          if (angular.isDefined(chart)) {
            nv.utils.windowResize(chart.update);
          }
        });

        var render = function() {
          if ($scope.data) {
            // $timeout(function() {
            chart.noData('无 数 据');

            var svg = d3.select($element[0])
              .datum($scope.data)
              .transition()
              .duration(500)
              .call(chart);
            // }, 0);
          }
        }
      }
    };
  }]);


  app.directive('nvd3Chart', ['$parse', '$window', '$timeout', 'd3',
    function($parse, $window, $timeout, d3) {
      return {
        restrict: 'EA',
        replace: true,
        template: '<svg style="height:100%; width:100%"></svg>',
        scope: {
          data: '=',
          delay: '@?'
        },
        link: function($scope, $element, $attrs) {


          var objectequality;
          if ($attrs.objectequality === undefined) {
            objectequality = false;
          } else {
            objectequality = $attrs.objectequality === 'true';
          }

          if (!angular.isString($scope.delay)) {
            $scope.delay = parseInt($scope.delay);
          } else {
            $scope.delay = 0;
          }

          var chart ;

          $timeout(function() {
            var d3ChartGetter = $parse($attrs.nvd3Chart);
            chart = d3ChartGetter($scope.$parent);

            if (angular.isDefined(chart)) {
              nv.utils.windowResize(chart.update);
            }

            nv.addGraph({
              generate: function() {
                return chart;
              },
              callback: null
            });

            $scope.$watch('data', function(data) {
              render();
            }, objectequality);

            var listener = function(event) {
              if (angular.isDefined(chart)) {
                nv.utils.windowResize(chart.update);
              }
            }

            $scope.$on('$locationChangeStart', function(event) {
              // 在切换其它页面时，应该取消监听
              $window.removeEventListener('resize', listener);
              console.log('remove resize listener');
            });
          }, $scope.delay);


          var render = function() {
            if ($scope.data) {
              $timeout(function() {
              chart.noData('无 数 据');

              var svg = d3.select($element[0])
                .datum($scope.data)
                .transition()
                .duration(500)
                .call(chart);
              }, 0);
            }
          }
        }
      };
  }]);

})();
