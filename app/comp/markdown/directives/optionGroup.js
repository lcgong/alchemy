
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

      let xpath;
      if($attrs.xpath) {
        xpath = $scope.xpath = $scope.$eval($attrs.xpath)
      }
      console.assert(xpath);

      let question = $sheet.questions[xpath[1]];
      let subquestion;
      if (xpath[0]) {
        let subquestion = question.subquestions[xpath[0]];
      }

      let optionGroup = (subquestion) ? subquestion : question;
      $sheet.optionGroup = optionGroup;

      $scope.$watch('optionGroup.targetedBlank', function(blank){
        console.log('option-group %s is targeting to %o', xpath, blank);
      });

    }
  };
}
