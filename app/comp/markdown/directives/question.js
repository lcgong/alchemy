
let app = angular.module('mainapp');

app.directive('question', questionDirective);
questionDirective.$inject = ['$parse', '$window', '$timeout'];
function questionDirective($parse, $window, $timeout) {

  return {
    restrict: 'E',
    require: '^questionMarkdown',
    replace: true,
    transclude: true,
    scope: true,
    templateUrl: 'app/comp/markdown/directives/question.html',

    link: function($scope, $element, $attrs, $sheet) {

      if($attrs.xpath) {
        $scope.xpath = $scope.$eval($attrs.xpath)
      }
      let xpath = $scope.xpath;
      let question = $sheet.questions[xpath[0]];

      $scope.displayNo = question.displayNo;


      $scope.click = function() {

        // 点击题目，也就是各选项和题空之外，则清除所有选择和候选标志
        // for (let blankNo in question._blanks) {
        //   let blank = question._blanks[blankNo];
        //
        //   blank.targetable = false;
        //   blank.targeted = false;
        //
        //   if (blank.targetingOptionGroup) {
        //     blank.targetingOptionGroup.targetable = false;
        //     blank.targetingOptionGroup.targeted = false;
        //   }
        // }
        console.log('question clicked')
      }
    }
  };
}
