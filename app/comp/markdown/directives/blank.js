
let app = angular.module('mainapp');

let template = `\
<span class="question-blank" style="width: 4ex">
  {{}}
</span>
`;

app.directive('questionBlank', questionBlankDirective);
questionBlankDirective.$inject = ['$parse', '$window', '$timeout'];
function questionBlankDirective($parse, $window, $timeout) {
  return {
    restrict: 'EA',
    require: '^questionMarkdown',
    replace: true,
    template: template,
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
}
