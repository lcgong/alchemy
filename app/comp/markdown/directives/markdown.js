
import MarkdownIt from "markdown-it";
import transform from '../json';
import {plugin as questionMarkdownPlugin} from "../plugin";
import {analyze} from "../analyzer/analyze"


let app = angular.module('mainapp');


app.directive('questionMarkdown', ['$templateRequest', questionMarkdown]);
function questionMarkdown($templateRequest) {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      opts: '=',
      content: '=',
      src: '='
    },
    controller: questionMarkdownCtrl,
    controllerAs: '$sheet',
    link: function($scope, $element, $attrs, $sheet) {

      if ($attrs.content) { // 从变量读取
        $scope.$watch('content', function(newValue, oldValue) {
          renderMarkdownContent(newValue);
        });
      }

      if ($attrs.src) { // 从文件读取
        scope.$watch('src', function(src) {
          $templateRequest(src, true).then(function(response) {
            set(response);
          });
        });
      }

      let md = new MarkdownIt();

      md.disable([ 'code'])
      md.use(questionMarkdownPlugin);


      function renderMarkdownContent(text) {
        text = unindent(text || '');

        let env = {};
        let options = {};
        let tokens = md.parse(text, env);
        let questions = analyze(tokens);

        $sheet.model = questions;

        let htmlstr = md.renderer.render(tokens, options, env);

        console.log('QuestionMarkdown: tokens=%O, questions=%O', tokens, questions);
        $element.html(htmlstr);

        // var jsonstr = JSON.stringify(tokens, null, Number(4));
        // element.html(htmlstr + '<hr><pre><code>\n' + jsonstr + '\n</code></pre>');
      }
    }
  };
}

questionMarkdownCtrl.$inject = ['$scope', '$element', '$attrs'];
function questionMarkdownCtrl($scope, $element, $attrs) {
  // console.log('QuestionMarkdownCtrl');

  let $sheet = this;


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
