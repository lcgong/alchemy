import "jquery"
import "bootstrap"
import angular from "angular";
import "angular-animate";
import "angular-resource";
import "angular-sanitize";
import "angular-i18n/angular-locale_zh-hans-cn";
// import "angular-bootstrap/ui-bootstrap.min.js";
// import "angular-bootstrap/ui-bootstrap-tpls.min.js";
import "angular-ui-router";
import "angular-ui-select";
import "angular-smart-table";

import "markdown-it";
import "markdown-it-mathjax";
import "angular-ui-codemirror";
import "codemirror";


import "d3"
import "nvd3"

var app = angular.module('mainapp', [
  'ngResource', 'ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap',
  'ui.select', 'smart-table', 'ui.codemirror'
]);

angular.element(document).ready(function() {
  System.import('app/main').then((main) => {
    // console.log("module 'main' loaded");

    angular.bootstrap(document.body, [app.name], {
      // strictDi: true
    });
  });
});
