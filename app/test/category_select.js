
import "app/comp/select/category_picker";
import "app/comp/select/category_picker.css!";
import "app/comp/select/category_select.css!";



angular.module('mainapp').controller('TestCtrl', TestCtrl);
TestCtrl.$inject = ['$scope', '$timeout'];
function TestCtrl($scope, $timeout) {
  console.log('start TestCtrl');
  var testCtrl = this;


  testCtrl.options = optionsData1;

  testCtrl.onSelectAbc = (category) => {
    testCtrl.abcSelected = category;
  };

  testCtrl.onSelectXyz = (category) => {
    testCtrl.xyzSelected = category;
  };

}

let optionsData1 = [
  '主类A/子类A1',
  '主类A/子类A2',
  '主类B/子类B1',
  '主类B/子类B2',
];
