
import "./settings.css!";

import "./settings";
import "./settings_desc";
import "./settings_tag";
import "./settings_cat";


angular.module('mainapp').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // 配置模块的页面路由规则

    $stateProvider.state('repos.settings.desc', {
      url: '/desc',
      templateUrl: 'app/repos/settings_desc.html'
    });

    $stateProvider.state('repos.settings.styles', {
      url: '/styles',
      templateUrl: 'app/repos/settings_sty.html'
    });

    $stateProvider.state('repos.settings.tags', {
      url: '/tags',
      templateUrl: 'app/repos/settings_tag.html'
    });

    $stateProvider.state('repos.settings.categories', {
      url: '/categories',
      templateUrl: 'app/repos/settings_cat.html'
    });

    $stateProvider.state('repos.settings.collaboration', {
      url: '/collaboration',
      templateUrl: 'app/repos/settings_collaboration.html'
    });

    $stateProvider.state('repos.settings.advanced', {
      url: '/advanced',
      templateUrl: 'app/repos/settings_advanced.html'
    });

}]);
