'use strict';
var app = angular.module('mainapp');

app.factory("UserSession", UserSession);
UserSession.$inject = ['$injector', '$rootScope'];

function UserSession($injector, $rootScope) {

  console.log('UserSession');

  $rootScope.userSession = {
    user: null,
    ready: false,
    who: who,
    logout: logout,
    login: login,
    changePassword: changePassword
  };

  var isLoginDlgOpen = false;


  var stateHistory = [];

  var mark = function() {
    var $state = $injector.get('$state');
    stateHistory.push({
      name: $state.current.name,
      params: $state.params
    });
    if (stateHistory.length > 50) {
      stateHistory.splice(0, stateHistory.length - 50);
    };
  };

  var back = function() {
    var $state = $injector.get('$state');
    var here = {
      name: $state.current.name,
      params: $state.params
    };
    var where;
    if (stateHistory.length > 1) {
      where = stateHistory[stateHistory.length - 2];
      $state.go(where.name, where.params).then(function() {
        console.info('ui-view %o == > %o', here, where);
      }, function() {
        console.info('failed in ui-view changing: %o == > %o', here, where);
      });
    } else {
      history.back();
      console.log('browser history go back');
    }
  };

  return {
    hasRole: function() {
      var roles = arguments;
      // console.log(roles);
      var user = $rootScope.userSession.user;

      if (angular.isUndefined(user) || user == null || angular.isUndefined(user.sys_roles)) {
        // console.warn("no user's role!");
        return false;
      }

      for (var i = roles.length - 1; i >= 0; i--) {
        for (var j = user.sys_roles.length - 1; j >= 0; j--) {
          if (user.sys_roles[j] == roles[i])
            return true;
        }
      }
      return false;
    },

    back: back,
    mark: mark,
  };

  function who() {
    var UserSessionModel = $injector.get('UserSessionModel');

    return UserSessionModel.who()
      .then(function(data) {
        var user = data[0];
        console.log('user-session: %o', angular.copy(user));
        if (angular.isObject($rootScope.userSession.user)) {
          angular.extend($rootScope.userSession.user, user);
        } else {
          $rootScope.userSession.user = angular.copy(user);
        }

        return user;
      });
  }

  function login() {
    if (isLoginDlgOpen) {
      console.log('The login dialog has already opend');
      return false;
    }

    isLoginDlgOpen = true;

    var $modal = $injector.get('$uibModal');
    return $modal.open({
      templateUrl: 'app/sys/session/LoginDialog.html',
      controller: 'LoginDialogCtrl',
      windowClass: 'login-dialog',
      backdrop: 'static'
    }).result.then(function(user) {
      $rootScope.userSession.who();
      isLoginDlgOpen = false;
      return user;
    });
  }

  function logout() {
    var UserSessionModel = $injector.get('UserSessionModel');
    var $state = $injector.get('$state');
    UserSessionModel.logout().then(function(session) {
      $rootScope.userSession.user = null;
      $rootScope.userSession.who();
    });
  }

  function changePassword(user) {
    if (!angular.isObject(user)) {
      user = {
        user_sn: $rootScope.userSession.user.user_sn
      }
    }

    var $modal = $injector.get('$uibModal');

    return $modal.open({
      templateUrl: 'app/sys/session/PasswordChangeDialog.html',
      controller: 'PasswordChangeDialogCtrl',
      keyboard: true, // 按ESC可退出
      backdrop: true, // 按背景也可退出
      resolve: {
        dialog: function() {
          return {
            user: user
          }
        }
      }
    }).result;
  }
}
