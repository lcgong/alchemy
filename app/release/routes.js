
import "./release.css!";
import "./release";
import "./model";
import "./schema";


angular.module('mainapp').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // 配置模块的页面路由规则

    $stateProvider.state('repos.release', {
      url: '/{repos_sn:[0-9]*[0-9]}/release',
      templateUrl: 'app/release/release.html'
    });

    $stateProvider.state('repos.release.schema', {
      url: '/schema',
      templateUrl: 'app/release/schema.html'
    });

    $stateProvider.state('repos.release.paper', {
      url: '/paper',
      templateUrl: 'app/release/paper.html'
    });
}]);
