
let app = angular.module('mainapp');

app.directive('optionGroup', optionGroupDirective);
optionGroupDirective.$inject = ['$parse', '$window', '$timeout'];
function optionGroupDirective($parse, $window, $timeout) {

  return {
    restrict: 'E',
    require: '^questionMarkdown',
    replace: true,
    transclude: true,
    scope: true,
    templateUrl: 'app/comp/markdown/directives/optionGroup.html',

    link: function($scope, $element, $attrs, $sheet) {

      // if($attrs.xpath) {
      //   $scope.xpath = $scope.$eval($attrs.xpath)
      // }
      // let xpath = $scope.xpath;
      // let question = $sheet.questions[xpath[1]];
      // let subquestion = question.subquestions[xpath[0]];
    }
  };
}
