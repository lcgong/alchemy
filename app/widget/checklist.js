

import "app/widget/checklist.css!";

angular.module('mainapp').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('widget_checklist', {
    url: "/widget_checklist",
    templateUrl: 'app/widget/checklist.html'
  });

}]);
