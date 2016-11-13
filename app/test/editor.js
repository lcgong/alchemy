
import "app/comp/markdown/directives/editor"
import "app/comp/markdown/directives/editor.css!"

import {data as sample1} from "./data/p01"
import {data as sample2} from "./data/p02"

let app = angular.module('mainapp');


// -------------------------------------------------------------------------
app.controller('TestCtrl', TestCtrl);
TestCtrl.$inject = [
  '$scope', '$timeout', '$injector'
];
function TestCtrl($scope, $timeout, $injector) {

  // console.log('QuestionMarkdownTestCtrl started');
  var ctrl = this;

  ctrl.samples = [
    { title:'P-01', data: sample1},
    { title:'P-02', data: sample2}
  ];

  // console.log(sample1);
  // console.log(sample2);


  ctrl.aceOptions = {
    useWrapMode : true,
    showGutter: true,
    advanced : {
      fontFamily: 'monospace', // 注意等宽字体，否则光标位置会错位
      fontSize: '14px'
    }
  }


  ctrl.sample = ctrl.samples[1];

  $scope.$watch('testCtrl.sample', function(sample, oldValue) {
    ctrl.markdownContent = sample.data;
  }, true);

  ctrl.modeChanged = function() {
    console.log('question mode changed: ', ctrl.mode);
  }


  ctrl.mode = 'editing';
  ctrl.modes = ["editing", "testing", "listing", "checking"];
  ctrl.modeChanged = function() {
    console.log('question mode changed: ', ctrl.mode);
  }

  ctrl.setSample = function(sampleNo) {
    ctrl.markdownContent = sample2;
  }

  ctrl.clear = function() {
    ctrl.markdownContent = '';
  }
}
