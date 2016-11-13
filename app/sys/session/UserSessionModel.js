"use strict";
var app = angular.module('mainapp');


app.factory('UserSessionModel', UserSessionModel);
UserSessionModel.$inject = ['restcli'];

function UserSessionModel(restcli) {

  return {
    who: who,
    login: login,
    logout: logout,
    changePassword: changePassword
  };

  function who() {
    var url = '/api/sys/user/me';
    return restcli.factory('GET', url)({});
  }

  function login(form) {
    var url = '/api/login';

    return restcli.factory('POST', url)({
      data: {
        login_id: form.principal,
        passwd: form.password
      }
    });
  }

  function logout() {
    var url = '/api/logout';
    return restcli.factory('POST', url)({});
  }

  function changePassword(form) {
    var url = '/api/sys/user/passwd/{user_sn}';

    return restcli.factory('POST', url)({
      pathargs: {
        user_sn: form.user_sn
      },
      data: form
    });
  }
}
