
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

import ace from "ace"
import "ace/mode-markdown"
import "markdown-it";

// import "markdown-it-mathjax";
// import "angular-ui-select";
// import "markdown-it-decorate";
// import "codemirror/lib/codemirror";
// import "angular-ui-ace";
// import "codemirror";
// import "angular-ui-codemirror";

// import MathJax from "mathjax"
// import "mathjax/MathJax.js";
// import "mathjax/extensions/MathMenu.js";
// import "mathjax/extensions/MathZoom.js";
// import "markdown-it-mathjax";

angular.module('mainapp', [
  'ngResource', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'
]);

angular.element(document).ready(function() {

  System.import('app/comp/markdown/test/main').then((main) => {


    angular.bootstrap(document.body, [app.name], {
      // strictDi: true
    });
  });
});
