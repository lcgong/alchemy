"use strict";
var app = angular.module('mainapp');

import 'app/comp/service/RouteHistory';


/**
  <button click-go-back max-level="3" ></button>
*/
app.directive("clickGoBack", clickGoBack);
clickGoBack.$inject = ['$state', 'RouteHistory'];

function clickGoBack($state, RouteHistory) {
  return {
    restrict: "A",
    compile: function($element, attr) {

      var maxLevel = parseInt(attr['maxLevel']);
      if (isNaN(maxLevel)) {
        maxLevel = null;
      }

      return function(scope, element) {
        element.on('click', function(event) {

          var viewUiRef = RouteHistory.getPreviousView(maxLevel);
          if (viewUiRef == null) {
            return;
          }
          $state.go(viewUiRef.name, viewUiRef.params);
          // console.log('click-go-back: ', viewUiRef.name, viewUiRef.params);
        });
      }
    }
  }
}
