'use strict';
var app = angular.module('mainapp');

app.config(initConfig);
initConfig.$inject = ['$stateProvider'];

function initConfig($stateProvider) {

  $stateProvider.state('logout', {
    url: '/logout',
    controller: 'LogoutCtrl'
  });
}

app.controller('LogoutCtrl', LogoutCtrl);
LogoutCtrl.$inject = ['$scope', 'UserSession'];

function LogoutCtrl($scope, UserSession) {
  UserSession.logout();
}
