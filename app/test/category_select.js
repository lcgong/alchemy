import "app/category/picker";


angular.module('mainapp').controller('TestCtrl', TestCtrl);
TestCtrl.$inject = ['$scope', '$timeout'];
function TestCtrl($scope, $timeout) {
  console.log('start TestCtrl');
  var testCtrl = this;



  testCtrl. optionsData1 = {
    '主类A/子类A1': {
      pinyinAliases: []
    },
    '主类A/子类A2': {},
    '主类B/子类B1': {},
    '主类B/子类B2': {},
  };


  testCtrl.optionsData2 = {
    '标签A': {
      pinyinAliases: []
    },
    '标签B': {
      pinyinAliases: ['bqB', 'biaoqianB']
    },
    '标签C': {
      pinyinAliases: []
    },
    '标签D': {
      pinyinAliases: []
    },
  };


  testCtrl.onSelectAbc = (category) => {
    console.log('abc selected', category);
    testCtrl.abcSelected = category;
  };

  testCtrl.onSelectXyz = (category) => {
    console.log('xyz selected', category);

    testCtrl.xyzSelected = category;
  };

}
