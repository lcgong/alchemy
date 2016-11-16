
import "app/layout.css!";

import "./model";

import "./repos_list.css!";
import "./repos_list";
import "./repos_list_grid";
import "./repos_new";

import "./workshop";

import "settings/routes"

angular.module('mainapp').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // 配置模块的页面路由规则

    $stateProvider.state('repos', {
      url: "/repos",
      template: '<div class="list-detail-view" ui-view >无页面</div>'
    });

    $stateProvider.state('repos.new', {
      url: '/new',
      templateUrl: 'app/repos/repos_new.html'
    });

    $stateProvider.state('repos.list', {
      url: '/list',
      templateUrl: 'app/repos/repos_list.html'
    });

    $stateProvider.state('repos.list.grid', {
      url: '/{source}',
      templateUrl: 'app/repos/repos_list_grid.html'
    });



    $stateProvider.state('repos.workshop', {
      url: '/{repos_sn:[0-9]*[0-9]}/workshop',
      templateUrl: 'app/repos/workshop.html'
    });

    $stateProvider.state('repos.workshop.questpad', {
      url: '/questpad/{quest_sn:[0-9]*[0-9]}',
      templateUrl: 'app/repos/questpad.html'
    });

    $stateProvider.state('repos.workshop.questlist', {
      url: '/questlist/{source}',
      templateUrl: 'app/repos/questlist.html'
    });


}]);
