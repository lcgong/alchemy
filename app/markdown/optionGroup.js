
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
    templateUrl: 'app/markdown/optionGroup.html',

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

      let optionGroup = ((subquestion) ? subquestion : question).optionGroup;
      $scope.optionGroup = optionGroup;

      optionGroup.targeted = false;
      optionGroup.targetable = false;

      $scope.click = function($event) {
        if ($sheet.mode === 'listing') {
          return;
        }
        $event.stopPropagation();

        // 点击option group，如果已经有blank的targeted，则取消target
        // 如果没有targeted，则选择候选的targetable的，
        // 如果唯一的targetable，则将其作为targeted

        if (optionGroup.targeted || optionGroup.targetable) {
          for (blank of optionGroup.targetableCandidates) {
            blank.targetable = false;
            blank.targeted = false;
          }

          optionGroup.targetable = false;

        } else { // 选择这个OptionGroup
          for (subquestion of question.subquestions) {
            // 先将其他OptionGroup取消选择
            if (subquestion.optionGroup == optionGroup) {
              continue;
            }

            for (blank of subquestion.optionGroup.targetableCandidates) {
              blank.targetable = false;
              blank.targeted = false;
            }

            optionGroup.targetable = false;
            optionGroup.targeted = false;
          }

          if (optionGroup.targetableCandidates.length == 1) {
            // 如果选项组唯一的对应题空，则自动进入targetted
            optionGroup.targetableCandidates[0].targeted = true;

          } else {
            for (blank of optionGroup.targetableCandidates) {
              blank.targetable = true;
            }
            optionGroup.targetable = true;
          }
        }
      };

      $scope.$watch('optionGroup.getTargetedBlank()', function(blank, oldBlank){
        if (blank) {
          console.log('option-group %o is targeting to blank %d',
            xpath, (blank) ? blank.blankNo : null );

          optionGroup.targeted = true;
          for (blank of optionGroup.targetableCandidates) {
            blank.targetable = true;
          }
        } else {
          console.log('option-group %o unset a target from blank %d',
            xpath, (oldBlank) ? oldBlank.blankNo : null);

          optionGroup.targeted = false;
        }
      });

    }
  };
}
