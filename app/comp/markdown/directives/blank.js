
let app = angular.module('mainapp');


app.directive('questionBlank', questionBlankDirective);
questionBlankDirective.$inject = ['$parse', '$window', '$timeout'];
function questionBlankDirective($parse, $window, $timeout) {

  return {
    restrict: 'E',
    require: '^questionMarkdown',
    replace: false,
    templateUrl: 'app/comp/markdown/directives/blank.html',
    link: function($scope, $element, $attrs, $sheet) {

      if($attrs.xpath) {
        $scope.xpath = $scope.$eval($attrs.xpath)
      }
      let xpath = $scope.xpath

      $scope.blank =$sheet.questions[xpath[1]]._blanks[xpath[0]];
    }
  };
}
