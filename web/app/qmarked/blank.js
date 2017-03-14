
import {setTarget, unsetTarget} from "./model/blank";

let app = angular.module('mainapp');


app.directive('questionBlank',
  ['$parse', '$window', '$timeout',
  function($parse, $window, $timeout) {
    return {
      restrict: 'E',
      require: '^questionMarkdown',
      replace: true,
      scope: true,
      templateUrl: 'app/markdown/blank.html',
      link: function($scope, $element, $attrs, $sheet) {

        if($attrs.xpath) {
          $scope.xpath = $scope.$eval($attrs.xpath)
        }
        let xpath = $scope.xpath
        console.assert(xpath);

        let question = $sheet.questions[xpath[1]];
        console.assert(question);

        let blank = question.blanks[xpath[0]];
        $scope.blank = blank;
        console.assert(blank);

        blank.targeted = false;

        $scope.click = function($event) {
          if ($sheet.mode === 'listing') {
            return;
          }
          $event.stopPropagation();

          blank.targeted = !blank.targeted;
        };

        $scope.$watch('blank.targetingOptionGroup', function(newValue, oldValue){

          // console.log('Blank-%d\'s target is changed: %o => %o', blank.blankNo,
            // (oldValue) ? oldValue.xpath : null,
            // (newValue) ? newValue.xpath : null);

          if (!newValue) {
            blank.targeted = false;
          }

        });

        $scope.$watch('blank.targeted', function(targeted, oldTargeted){

          if (targeted) {
            // 在答题过程中只允许一个处于targeded状态，因此需要先要解除其他关系
            for (blank_no in question.blanks) {
              let otherTarget = question.blanks[blank_no];
              if (otherTarget === blank) {
                continue;
              }

              if (otherTarget.targetingOptionGroup) {
                otherTarget.unsetTarget();
              }
            }

            blank.setTarget();

          } else if (blank.targetingOptionGroup != null) {
            let otherTarget;
            for (let thisblank of blank.targetingOptionGroup.targetableCandidates) {
              if (thisblank != blank && blank.targeted) {
                otherTarget = blank;
                break;
              }
            }

            if (!otherTarget) {
              // 不是因为从该题空到其他候选题空的选择，完全没有被选的
              // 自动取消候选选择。因为此时target关系已经取消，需要重新找打

              let oldOptionGroup = blank.getTargetingOptionGroup();
              oldOptionGroup.targetable = false;

              for (let thisblank of oldOptionGroup.targetableCandidates) {
                thisblank.targetable = false;
              }
            }

            blank.unsetTarget();
          } else {
            // 从选择此blank到选择其他，已经没有option group
            blank.targetable = false;
          }
        });
      }
    };
  }
]);
