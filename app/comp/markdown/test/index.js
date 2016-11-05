
// import CSS
// System.import('bootstrap/css/bootstrap.min.css!');
// System.import('animate.css/animate.min.css!');
// System.import('app/comp/markdown/markdown.css!');
// import "bootstrap/css/bootstrap.min.css!";
// import "animate.css/animate.min.css!";
//
// import "app/comp/markdown/markdown.css!";

import "jquery"
import "bootstrap"
import angular from "angular";
import "angular-animate";
import "angular-resource";
import "angular-sanitize";
import "angular-i18n/angular-locale_zh-hans-cn";
import "angular-bootstrap/ui-bootstrap.min.js";
import "angular-bootstrap/ui-bootstrap-tpls.min.js";


var app = angular.module('mainapp', [
  'ngResource', 'ngSanitize', 'ngAnimate', 'ui.bootstrap',
]);

angular.element(document).ready(function() {
  System.import('app/comp/markdown/test/main').then((main) => {

    angular.bootstrap(document.body, [app.name], {
      // strictDi: true
    });
  });
});
