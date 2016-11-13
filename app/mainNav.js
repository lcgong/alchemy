'use strict';


var app = angular.module('mainapp');

app.directive('mainNav', function() {
  return {
    scope: true,
    templateUrl: 'mainNav.html'
  };
});
