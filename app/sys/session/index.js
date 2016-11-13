'use strict';

import "app/sys/session/LoginDialogCtrl";
import "app/sys/session/PasswordChangeDialogCtrl";
import "app/sys/session/UserSession";
import "app/sys/session/UserSessionModel";

var app = angular.module('mainapp');

app.run(initRun);
initRun.$inject = ['$rootScope', '$timeout'];

function initRun($rootScope, $timeout) {

  $timeout(function() {
    $rootScope.userSession.who();
  });
}
