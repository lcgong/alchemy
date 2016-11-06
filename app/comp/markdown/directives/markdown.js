
import {unindent} from "../util";
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
        let questions = analyze(tokens);

        $sheet.questions = questions;

        let startQuestionNo = $scope.startQuestionNo;
        for (q of questions) {
          q.displayNo = startQuestionNo;
          startQuestionNo += 1;
        }

        let html =  md.renderer.render(tokens, options, env);
        // $element.html(html);
        // console.log(html);

        $sheet.questions = questions;
        $sheet.htmlContent = html;

        console.log('QuestionMarkdown: tokens=%O, questions=%O', tokens, questions);
      }
    }
  };
}
