"use strict";

import marked from "marked";

let app = angular.module('mainapp');

// import "marked"
app.directive('questionMarked', ['$templateRequest', questionMarked]);

function questionMarked($templateRequest) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      opts: '=',
      marked: '=',
      src: '='
    },
    link: function(scope, element, attrs) {
      set(scope.marked || element.text() || '');

      if (attrs.marked) {
        scope.$watch('marked', set);
      }

      if (attrs.src) {
        scope.$watch('src', function(src) {
          $templateRequest(src, true).then(function(response) {
            set(response);
          });
        });
      }


      var options = {
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
      };

      function set(text) {
        var text = unindent(text || '');

        var lexer = new marked.Lexer(options);
        var tokens = lexer.lex(text);
        console.log(1234, tokens);
        console.log(1235, lexer.rules);

        // var tokens = marked.lexer(text, options);
        // console.log(123334, marked.parser(tokens));

        var html = marked(text, options || null);

        element.html(html);
      }
    }
  };
}

function unindent(text) {
  if (!text) {
    return text;
  }

  var lines = text
    .replace(/\t/g, '  ')
    .split(/\r?\n/);

  var min = null;
  var len = lines.length;

  for (var i = 0; i < len; i++) {
    var line = lines[i];
    var l = line.match(/^(\s*)/)[0].length;
    if (l === line.length) {
      continue;
    }
    min = (l < min || min === null) ? l : min;
  }

  if (min !== null && min > 0) {
    for (i = 0; i < len; i++) {
      lines[i] = lines[i].substr(min);
    }
  }
  return lines.join('\n');
}
