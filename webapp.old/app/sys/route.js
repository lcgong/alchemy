'use strict';

var app = angular.module('mainapp');

app.config(initConfig);
initConfig.$inject = ['$stateProvider'];

function initConfig($stateProvider) { // 配置模块的页面路由规则

  $stateProvider.state('sys', {
    url: "/sys",
    template: '<div ui-view ></div>'
  });
}

app.run(initRun);
initRun.$inject = ['$rootScope'];

function initRun($rootScope) {

  $rootScope.isString = angular.isString; // a shortcut, for convenience
}
