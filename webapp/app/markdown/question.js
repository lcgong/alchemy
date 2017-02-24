
let app = angular.module('mainapp');

app.directive('question', questionDirective);
questionDirective.$inject = ['$parse', '$window', '$timeout'];
function questionDirective($parse, $window, $timeout) {

  return {
    restrict: 'E',
    require: '^questionMarkdown',
    replace: true,
    transclude: true,
    scope: true,
    templateUrl: 'app/markdown/question.html',

    link: function($scope, $element, $attrs, $sheet) {

      if($attrs.xpath) {
        $scope.xpath = $scope.$eval($attrs.xpath)
      }
      let xpath = $scope.xpath;
      let question = $sheet.questions[xpath[0]];

      $scope.displayNo = question.displayNo;


      $scope.click = function($event) {
        $sheet.clearTargets();
      }
    }
  };
}
