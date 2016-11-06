
let app = angular.module('mainapp');

app.directive('blankOption', blankOptionDirective);
blankOptionDirective.$inject = [];
function blankOptionDirective() {

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
        console.error('no xpath found');
        return;
      }



      let question = $sheet.questions[xpath[2]];

      if (xpath[1] != null) { // xpath: ['A', 0, 0] or ['A', null, 0]
        question = question.subquestions[xpath[1]];
      }

      console.assert(question, 'question required', xpath);

      let optionGroup = question.optionGroup;
      let option = optionGroup.options[xpath[0]]

      $scope.option = option;
    }
  };
}
