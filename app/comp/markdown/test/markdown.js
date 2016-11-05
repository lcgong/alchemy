
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

  ctrl.markdownContent = '';

  ctrl.setSample = function(sampleNo) {
    ctrl.markdownContent = sample1;
  }

  ctrl.clear = function() {
    ctrl.markdownContent = '';
  }
}
