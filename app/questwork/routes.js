
import "./workshop";


angular.module('mainapp').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // 配置模块的页面路由规则


    $stateProvider.state('repos.workshop', {
      url: '/{repos_sn:[0-9]*[0-9]}/workshop',
      templateUrl: 'app/questwork/workshop.html'
    });

    $stateProvider.state('repos.workshop.questpad', {
      url: '/questpad/{quest_sn:[0-9]*[0-9]}',
      templateUrl: 'app/questwork/questpad.html'
    });

    $stateProvider.state('repos.workshop.questlist', {
      url: '/questlist/{source}',
      templateUrl: 'app/questwork/questlist.html'
    });

}]);
