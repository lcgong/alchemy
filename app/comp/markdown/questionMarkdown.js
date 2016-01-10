"use strict";


// console.log(q);
let app = angular.module('mainapp');

import MarkdownIt from "markdown-it";
import questionMarkdownPlugin from "./plugin";
import transform from './json';

console.log(transform);

// console.log(332);
`
###1 设计

###2 涉及



`



var sample = `\
##1 选择题

操作系统__(1)__分布系统__(2)__界面

###1 多选题
(A): 面向**对象**


###2 单选题
涉及 __()__


(A): this is a
  dss
(B): The following is

(C): an apple.

（D，固定）： 以上都错误

  %%% (B) (C)

  应该这样...

 %%%

dd
`;


// "    >  ahis is a\n" +
// "         a\n" +
// "          \n" +
// "    > that is an  \n"

//
// function convertToHex(str) {
//     var hex = '';
//     for(var i=0;i<str.length;i++) {
//         hex += '\\' + str.charCodeAt(i).toString(16);
//     }
//     return hex;
// }
// console.log(convertToHex(sample));

app.directive('questionMarkdown', ['$templateRequest', questionMarkdown]);

function questionMarkdown($templateRequest) {
  // console.log(333);


  return {
    restrict: 'AE',
    replace: true,
    scope: {
      opts: '=',
      marked: '=',
      src: '='
    },
    link: function(scope, element, attrs) {

      var md = new MarkdownIt();
      md.use(questionMarkdownPlugin);


      // var text = unindent(text || '');

      var text = sample;

      var env = {};
      var options = {};
      var tokens = md.parse(text, env);

      // var tokens = transform.encode(tokens);

      var htmlstr = md.renderer.render(tokens, options, env);
      // var htmlstr = JSON.stringify(tokens, null, Number(4));

      // console.log(htmlstr);

      element.html('<pre>\n' + htmlstr + '\n</pre>');


      return;

      set(sample);


      // set(scope.marked || element.text() || '');


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


      function set(text) {
        var text = unindent(text || '');

        var env = {};
        var options = {};
        var tokens = md.parse(text, env);

        var htmlstr = md.renderer.render(tokens, options, env);
        // var jsonstr = JSON.stringify(tokens, null, Number(4));

        // console.log(jsonstr);

        // element.html('<pre>\n' + jsonstr + '\n</pre>');
        element.html('<pre>\n' + htmlstr + '\n</pre>');
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
