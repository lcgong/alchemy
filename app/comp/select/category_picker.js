import "app/comp/select/category_select";
import "app/comp/markdown/directives/include"

angular.module('mainapp').controller('categoryPickerCtrl', categoryPickerCtrl);
categoryPickerCtrl.$inject = ['$scope', '$element', '$attrs'];
function categoryPickerCtrl($scope, $element, $attrs) {
  console.log('categoryPickerCtrl');

  let $picker = this;

}

var pickerTmpl = `\
<category-select
  options="options"
  on-select="onSelect($selected)">
</category-select>
`;

angular.module('mainapp').directive('categoryPicker', categoryPicker);
categoryPicker.$inject = ['$document', '$animate', '$templateRequest',
  '$compile', '$parse', '$timeout'];
function categoryPicker($document, $animate, $templateRequest, $compile, $parse, $timeout) {

  return {
    restrict: 'E',
    replace: true,
    // require: ['?ngModel'],
    scope: {
      options: '=',
    },
    transclude: true,
    templateUrl: 'app/comp/select/category_picker.html',
    controller: 'categoryPickerCtrl',
    // controllerAs: '$picker',
    link: function($scope, $element, $attrs, ctrls) {
      // let [ngModelCtrl, $picker] = ctrls;

      let $picker = ctrls;

      $scope.onSelectExpr = $parse($attrs.onSelect);

      $scope.onSelect = (selected) => {
        $timeout(function(){
          $scope.onSelectExpr($scope.$parent, {'$selected': selected});
          $scope.open = false;
        });
      };

      $scope.$watch('open', open => {
        if (open) {
          $scope.pickerTmpl = pickerTmpl;
        } else {
          $scope.pickerTmpl = '';
        }
      });


      //----------------------------------------------------------------------
      function onDocumentClick(e) {
        if (!$scope.open)
          return; //Skip it if dropdown is close

        let contains = $element[0].contains(e.target);
        if (contains) {
          return;
        }

        $timeout(function(){
          $scope.open = false;
        });

        $scope.$digest();
      }

      $document.on('click', onDocumentClick);

      $scope.$on('$destroy', function() {
        $document.off('click', onDocumentClick);
      });

    }
  };
}
