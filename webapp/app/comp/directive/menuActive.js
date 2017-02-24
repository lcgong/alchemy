"use strict";
var app = angular.module('mainapp');


app.directive('menuActive', menuActive);
menuActive.$inject = [];

function menuActive() {
  return {
    restrict: "A",
    controller: menuActiveCtrl
  };
}

menuActiveCtrl.$inject = ['$scope', '$element', '$attrs', '$state'];

function menuActiveCtrl($scope, $element, $attrs, $state) {
  var state = $attrs.menuActive;

  if (!(angular.isString(state) && state.trim().length > 0) ) {
    // 如果没指定状态，则尝试从ui-sref读取状态
    var sref = $attrs.uiSref;
    if (angular.isString(sref)) {
      var matched = /([^\(]+)/.exec(sref);
      state = matched[1];
    }
  }

  function update() {

    if ($state.includes(state) || $state.is(state)) {
      $element.addClass("active");
    } else {
      $element.removeClass("active");
    }
  }

  $scope.$on('$stateChangeSuccess', update);

  update();
}
