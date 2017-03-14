'use strict';

var app = angular.module('mainapp');

app.config(MainConfig);
MainConfig.$inject = [
  '$provide', '$httpProvider', '$locationProvider', 'stConfig'
];

function MainConfig($provide, $httpProvider, $locationProvider, stConfig) {

  $httpProvider.interceptors.push('HttpErrorInterceptor');
  $provide.decorator('$exceptionHandler', ExceptionHandler);

  // 避免和路径hashtag凌乱的方式
  $locationProvider.html5Mode(true).hashPrefix('!');

  stConfig.pagination.itemsByPage = 50;
  stConfig.pagination.template = 'app/comp/pagination.html';

}

app.factory('HttpErrorInterceptor', HttpErrorInterceptor);
HttpErrorInterceptor.$inject = ['$q', 'UserSession', 'Notifier', '$rootScope'];

function HttpErrorInterceptor($q, UserSession, Notifier, $rootScope) {

  return {
    responseError: handleHttpError
  };

  function handleHttpError(rej) {
    var errmsg = '';

    if (rej.data !== null) {
      errmsg = rej.data[0].message;
    } else {
      errmsg = rej.statusText;
    }

    if (rej.status <= 0) {
      Notifier.alert({
        type: 'danger',
        title: '网络连接出错(' + rej.status + ')',
        message: ''
      });
    } else if (rej.status == 401) {
      $rootScope.userSession.login();

    } else if (rej.status == 403) {
      Notifier.alert({
        type: 'danger',
        title: '权限不足',
        message: errmsg
      });
    } else if (rej.status == 404) {
      Notifier.alert({
        type: 'danger',
        title: '未找到服务入口(404)',
        message: '地址：' + rej.config.url
      });
    } else if (rej.status == 409) { //409 Conflict
      // 违反数据的业务规则
      Notifier.alert({
        type: 'danger',
        title: '操作错误',
        message: errmsg
      });
    } else {
      Notifier.alert({
        type: 'danger',
        title: '意外服务错误(' + rej.status + ')',
        message: errmsg
      });
    }
    return $q.reject(rej);
  };
}

ExceptionHandler.$inject = ['$delegate', '$injector'];

function ExceptionHandler($delegate, $injector) {
  return function(exception, cause) {

    // use $inject to avoid circular dependency
    // $rootScope <- Notifier <- $exceptionHandler <- $rootScope
    var Notifier = $injector.get('Notifier');

    Notifier.alert({
      type: 'danger',
      title: '客户端意外错误',
      message: exception.toString()
    });

    $delegate(exception, cause);
  };
}
