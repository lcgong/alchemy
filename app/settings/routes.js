
import "./settings.css!";

import "./settings";
import "./settings_desc";
import "./settings_tag";
import "./settings_cat";


angular.module('mainapp').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // 配置模块的页面路由规则

    $stateProvider.state('repos.settings', {
      url: '/{repos_sn:[0-9]*[0-9]}/settings',
      templateUrl: 'app/settings/settings.html'
    });

    $stateProvider.state('repos.settings.desc', {
      url: '/desc',
      templateUrl: 'app/settings/settings_desc.html'
    });

    $stateProvider.state('repos.settings.styles', {
      url: '/styles',
      templateUrl: 'app/settings/settings_sty.html'
    });

    $stateProvider.state('repos.settings.tags', {
      url: '/tags',
      templateUrl: 'app/settings/settings_tag.html'
    });

    $stateProvider.state('repos.settings.categories', {
      url: '/categories',
      templateUrl: 'app/settings/settings_cat.html'
    });

    $stateProvider.state('repos.settings.collaboration', {
      url: '/collaboration',
      templateUrl: 'app/settings/settings_collaboration.html'
    });

    $stateProvider.state('repos.settings.advanced', {
      url: '/advanced',
      templateUrl: 'app/settings/settings_advanced.html'
    });

}]);
