import "./include";
import "./question";
import "./subquestion";
import "./blank";
import "./optionGroup";
import "./option";

import "./markdown.css!";

import {unindent} from "./util";
import MarkdownIt from "markdown-it";
import transform from './json';
import {plugin as questionMarkdownPlugin} from "./plugin";
import {analyze} from "./analyzer/analyze";

import  {plugin as mathjax} from './mathjax';


import "app/markdown/markdown.css!";

let app = angular.module('mainapp');


app.controller('questionMarkdownCtrl', questionMarkdownCtrl);
questionMarkdownCtrl.$inject = ['$scope', '$element', '$attrs'];
function questionMarkdownCtrl($scope, $element, $attrs) {

  let $sheet = this;


  /** 检查作答结果是否正确
   */
  $sheet.checkResult = function(blank) {
    let resolved = blank.resolved;
    let solution = blank.solution;

    if (!resolved || !solution || resolved.length != solution.length) {
      return false;
    }

    resolved.sort();
    solution.sort();

    for (let i = resolved.length -1; i >=0; i --) {
      if (resolved[i] != solution[i]) {
        return false;
      }
    }
    return true;
  }

  $sheet.clearTargets = function() {
    // 点击题目，也就是各选项和题空之外，则清除所有选择和候选标志
    for (let question of $sheet.questions) {
      for (let blank of Object.values(question._blanks)) {
        blank.targetable = false;
        blank.targeted = false;
      }

      for (subquestion of question.subquestions) {
        let optionGroup = subquestion.optionGroup;
        if (optionGroup) {
          optionGroup.targetable = false;
          optionGroup.targeted = false;
        }
      }
      let optionGroup = question.optionGroup;
      if (optionGroup) {
        optionGroup.targetable = false;
        optionGroup.targeted = false;
      }
    }
  }
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
      // mode: '='
    },
    template: '<div class="question-markdown" include-template="$sheet.htmlContent" on-precompile-func="$sheet.precompileSheet"></div>',
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
        $scope.$watch('mode', function(newValue, oldValue) {
            $sheet.mode = newValue;
            $sheet.mode = 'editing';
            // console.log(333, $scope.mode);
        });
      } else {
        $sheet.mode = 'editing';
      }
      $sheet.mode = 'editing';

      // console.log(markdown_it_mathjax)

      let md = new MarkdownIt();
      md.disable([ 'code'])
      md.use(mathjax); // prevent markdown tag parsed in mathjax
      md.use(questionMarkdownPlugin);

      // right
      // console.log(1234, md.render('$1+2 __(1)__$'));
      // 放回： \(1+2 __(1)__\)
      // 因为下面最后多了一个空格导致mathjax-plugin没办法识别这个标签
      // console.log(1235, md.render('$1+2 __(1)__ $'));
      // 返回： $1+2 <question_blank xpath=""></question_blank> $

      // TODO 在公式里添加 blank ，
      // 需要先将__()__解析为\QuestBlank类似的tax标签，
      // 这需要定制markdown_it_mathjax组件
      // 注意只能是字母，mathjax解析完后，在文本替换\QuestionBlank，
      // 替换成<question-blank>.
      $sheet.precompileSheet = function($element) {
        // 装配MathJax
        if (typeof MathJax !== 'undefined') {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, $element[0]]);
        } else {
          console.warn('MathJax is not found');
        }
      };

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

        // console.log('QuestionMarkdown: tokens=%O, questions=%O', tokens, questions);
      }
    }
  };
}

export function analyzeMarkdownText(text) {
  text = unindent(text || '');

  let md = new MarkdownIt();
  md.disable([ 'code'])
  md.use(mathjax); // prevent markdown tag parsed in mathjax
  md.use(questionMarkdownPlugin);

  let env = {};
  let options = {};
  let tokens = md.parse(text, env);
  let questions = analyze(tokens);

  return questions;
}