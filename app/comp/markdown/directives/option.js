
let app = angular.module('mainapp');

app.directive('questionOption', questionOptionDirective);
questionOptionDirective.$inject = ['$parse', '$window', '$timeout'];
function questionOptionDirective($parse, $window, $timeout) {

  return {
    restrict: 'E',
    require: '^questionMarkdown',
    replace: true,
    transclude: true,
    scope: true,
    templateUrl: 'app/comp/markdown/directives/option.html',

    link: function($scope, $element, $attrs, $sheet) {

      if($attrs.xpath) {
        $scope.xpath = $scope.$eval($attrs.xpath)
      }
      let xpath = $scope.xpath;
      if (!xpath) {
        console.warn('no xpath found');
        return;
      }

      let question = $sheet.questions[xpath[2]];
      if (xpath[2] != null) {
        question = question.subquestion[xpath[1]];
      }

      let optionGroup = question.optionGroup;
      let option = optionGroup.options[xpath[0]]

      $scope.option = option;
    }
  };
}
