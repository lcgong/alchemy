
import {setTarget, unsetTarget} from "../model/blank";

let app = angular.module('mainapp');


app.directive('questionBlank',
  ['$parse', '$window', '$timeout',
  function($parse, $window, $timeout) {
    return {
      restrict: 'E',
      require: '^questionMarkdown',
      replace: true,
      scope: true,
      templateUrl: 'app/comp/markdown/directives/blank.html',
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

        $scope.targeted = false;

        $scope.click = function() {
          $scope.targeted = !$scope.targeted;
        };

        $scope.$watch('blank.targetingOptionGroup', function(newValue, oldValue){

          console.log('Blank-%d\'s target is changed: %o => %o', blank.blankNo,
            (oldValue) ? oldValue.xpath : null,
            (newValue) ? newValue.xpath : null);

          if (!newValue) {
            $scope.targeted = false;
          }

        });

        $scope.$watch('targeted', function(targeted){

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
              blank.unsetTarget();
          }
        });
      }
    };
  }
]);
