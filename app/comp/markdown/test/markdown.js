
import {sample1} from "./data1"

let app = angular.module('mainapp');


// -------------------------------------------------------------------------
app.controller('QuestionMarkdownTestCtrl', QuestionMarkdownTestCtrl);
QuestionMarkdownTestCtrl.$inject = [
  '$scope', '$timeout', '$injector'
];
function QuestionMarkdownTestCtrl($scope, $timeout, $injector) {

  // console.log('QuestionMarkdownTestCtrl started');
  var ctrl = this;

  ctrl.sample = sample1;

  ctrl.setSample = function(sampleNo) {
    console.log('set');
      ctrl.sample = sample1;
  }

  ctrl.clear = function() {
    console.log('clear');

      ctrl.sample = '';
  }
}
