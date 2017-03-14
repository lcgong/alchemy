
let app = angular.module('mainapp');

app.directive('subquestion', subquestionDirective);
subquestionDirective.$inject = ['$parse', '$window', '$timeout'];
function subquestionDirective($parse, $window, $timeout) {

  return {
    restrict: 'E',
    require: '^questionMarkdown',
    replace: true,
    transclude: true,
    scope: true,
    templateUrl: 'app/markdown/subquestion.html',

    link: function($scope, $element, $attrs, $sheet) {

      if($attrs.xpath) {
        $scope.xpath = $scope.$eval($attrs.xpath)
      }
      let xpath = $scope.xpath;
      let question = $sheet.questions[xpath[1]];
      let subquestion = question.subquestions[xpath[0]];

      $scope.subquestion = subquestion;
    }
  };
}
