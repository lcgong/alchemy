
import MarkdownIt from "markdown-it";
import transform from '../json';
import {plugin as questionMarkdownPlugin} from "../plugin";
import {analyze} from "../analyzer/analyze"


let app = angular.module('mainapp');


app.controller('questionMarkdownCtrl', questionMarkdownCtrl);
questionMarkdownCtrl.$inject = ['$scope', '$element', '$attrs'];
function questionMarkdownCtrl($scope, $element, $attrs) {
  $scope.thisSheet = {};
}


app.directive('questionMarkdown', questionMarkdownDirective);
questionMarkdownDirective.$inject = ['$templateRequest', '$compile'];
function questionMarkdownDirective($templateRequest, $compile) {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      startQuestionNo: '=',
      content: '=',
      mode: '='
    },
    template: '<div include-template="$sheet.htmlContent"></div>',
    controller: 'questionMarkdownCtrl',
    controllerAs: '$sheet',
    link: function($scope, $element, $attrs, $sheet) {

      if ($attrs.content) { // 从变量读取
        $scope.$watch('content', function(newValue, oldValue) {
          renderMarkdownContent(newValue);
        });
      }

      if ($attrs.startQuestionNo) {
        $scope.$watch('startQuestionNo', function(newValue, oldValue) {
          renderMarkdownContent($scope.content);
        });
      }

      if ($attrs.mode) {
        $sheet.mode = 'listing';
      }
      $scope.$watch('$scope.mode', function(newValue, oldValue) {
        if (newValue) {
          $sheet.mode = newValue;
        }
      });


      let md = new MarkdownIt();
      md.disable([ 'code'])
      md.use(questionMarkdownPlugin);


      function renderMarkdownContent(text) {
        text = unindent(text || '');

        let env = {};
        let options = {};
        let tokens = md.parse(text, env);
        let questions = [];
        // let questions = analyze(tokens);

        let startQuestionNo = $scope.startQuestionNo;
        for (q of questions) {
          q.displayNo = startQuestionNo;
          startQuestionNo += 1;
        }

        $sheet.questions = questions;
        $sheet.htmlContent = md.renderer.render(tokens, options, env);

        console.log('QuestionMarkdown: tokens=%O, questions=%O', tokens, questions);
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
