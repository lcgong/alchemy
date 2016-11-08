
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
      if (xpath[0] !== null) {
        subquestion = question.subquestions[xpath[0]];
      }

      $scope.targeted = false;

      let optionGroup = ((subquestion) ? subquestion : question).optionGroup;
      $scope.optionGroup = optionGroup;

      console.log('option-group: ', optionGroup.xpath, optionGroup);

      $scope.$watch('optionGroup.getTargetedBlank()', function(blank, oldBlank){
        if (blank) {
          console.log('option-group %o is targeting to blank %d',
            xpath, (blank) ? blank.blankNo : null );

          $scope.targeted = true;
        } else {
          console.log('option-group %o unset a target from blank %d',
            xpath, (oldBlank) ? oldBlank.blankNo : null);

          $scope.targeted = false;
        }
      });

    }
  };
}
