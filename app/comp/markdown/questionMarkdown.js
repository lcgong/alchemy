"use strict";


// console.log(q);
let app = angular.module('mainapp');

import MarkdownIt from "markdown-it";
import questionMarkdownPlugin from "./plugin";


// console.log(332);
`
###1 设计

###2 涉及

%%% (B) (C)

应该这样...

%%%

`

var sample =`\

##1 选择题

###1 多选题
(A): 面向对象


###2 单选题
涉及


(A): this is a
  dss
(B): The following is

(C): an apple.

（D，固定）： 以上都错误


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


      console.log(332, md);

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
        var tokens = md.parse(text, {});

        var jsonstr = JSON.stringify(tokens, null, Number(4));
        // console.log(jsonstr);



        // var html = md.render('');

        element.html('<pre>\n'+jsonstr+'\n</pre>');
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
