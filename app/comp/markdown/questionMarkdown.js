"use strict";


// console.log(q);
let app = angular.module('mainapp');

import MarkdownIt from "markdown-it";
import transform from './json';
import {questionMarkdownPlugin} from "./plugin";
import {analyze} from "./analyze"

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


var sample = `\
##1 单选题
为验证程序模块A是否正确实现了规定的功能，需要进行 __(1)__；
为验证模块A能否与其他模块按照规定方式正确工作，需要进行__(2)__。

  ~~~python
  def f():
    a = 1
  ~~~

###1 单选题 一行四项
 __(1)__

  (A): 单元测试

  (B): 集成测试

  (C, 整行): 确认测试
  (D): 系统测试

  %%% 答案  (A)

###2 单选题 一行四项



  (A): 单元测试
  (B): 集成测试
  (C): 确认测试
  (D): 系统测试

  %%% 答案：(B)
`


var sample2 = `
###1
%%% 答案 (A)

%%% 分析

%%%评阅

`
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
      md.disable([ 'code'])
      md.use(questionMarkdownPlugin);

      // var text = unindent(text || '');

      var text = sample;

      var env = {};
      var options = {};
      var tokens = md.parse(text, env);

      // console.log(tokens);
      var sobj = {questionList: []}

      let questions = analyze(tokens);

      console.log(questions);

      var htmlstr = md.renderer.render(tokens, options, env);
      var jsonstr = JSON.stringify(tokens, null, Number(4));
      element.html(htmlstr + '<hr><pre><code>\n' + jsonstr + '\n</code></pre>');

      // var tokens = transform.encode(tokens);

      // element.html('<pre>\n' + htmlstr + '\n</pre>');

      // console.log(htmlstr);

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


        console.log(rules);

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
