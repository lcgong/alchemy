
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

      $scope.isSolution = function() {
        if (!optionGroup.targeted) {
          return false;
        }

        let blank = optionGroup.getTargetedBlank();
        if (!blank) {
          console.error('无法找到该选项的题空: option\'s xpath=', option.xpath);
          return;
        }

        return blank.solution && blank.solution.indexOf(option.optionNo) >= 0;
      }


      $scope.isChecked = function() {
        if (!optionGroup.targeted) {
          return false;
        }

        let blank = optionGroup.getTargetedBlank();
        if (!blank) {
          console.error('无法找到该选项的题空: option\'s xpath=', option.xpath);
          return;
        }

        return blank.resolved.indexOf(option.optionNo) >= 0;

      }


      $scope.click = function($event) {
        if ($sheet.mode !== 'testing') {
          return;
        }

        if (!optionGroup.targeted) {
          return;
        }
        $event.stopPropagation();

        let blank = optionGroup.getTargetedBlank();
        if (!blank) {
          console.error('无法找到该选项的题空: option\'s xpath=', option.xpath);
          return;
        }

        let optionNo = option.optionNo;

        let answerIdx =  blank.resolved.indexOf(optionNo);
        if (answerIdx < 0) { // no checked
          blank.resolved.push(optionNo);
        } else { // checked
          blank.resolved.splice(answerIdx, 1); // delete the answer
        }
        blank.resolved.sort();

        console.log("blank resolved: ", blank.resolved);
      }
    }
  };
}
