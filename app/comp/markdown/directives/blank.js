
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

        $scope.model = {};

        $scope.blank = blank;
        $scope.blank = blank;

        console.assert(blank);

        $scope.targeted = false;

        $scope.click = function() {
          $scope.targeted = !$scope.targeted;
        };
        //
        // $scope.$watch('model.blank', function(newValue, oldValue){
        //   console.log(66666, newValue, oldValue);
        // });

        $scope.$watch('blank.targetingOptionGroup', function(newValue, oldValue){
          console.log('targing changed: new=%o, old=%o', newValue, oldValue);
          if (!newValue) {
            $scope.targeted = false;
          }
        });

        $scope.$watch('targeted', function(targeted){


          // console.log('targeted', $scope.targeted, xpath,
          //   blank.targetingOptionGroup,
          //   $scope.model.blank.targetingOptionGroup);

          if (targeted) {
            // 寻找一个目标
            let optionGroup = blank.getTargetingOptionGroup();
            console.assert(optionGroup);

            if (optionGroup) {
              setTarget(blank, optionGroup);
              console.log('set a target from option-group %o to blank %o',
              optionGroup.xpath, blank.xpath);
            } else {
              console.error('cannot find option group, blank:', blank);
            }

          } else {
            if (blank.targetingOptionGroup) {
              let optionGroup = blank.targetingOptionGroup;
              unsetTarget(blank, optionGroup);
              console.log('unset a target: option-group=%o, blank=%o',
                          optionGroup.xpath, blank.xpath);
            } else {
              unsetTarget(blank, null);
              console.log('unset a target: option-group=null, blank=%o',
                          blank.xpath);
            }
          }
        });
      }
    };
  }
]);
