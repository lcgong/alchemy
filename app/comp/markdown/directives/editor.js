import "app/category/picker";
import "app/category/badge";
import "./markdown";

let app = angular.module('mainapp');

app.controller('questionEditorCtrl', questionEditorCtrl);
questionEditorCtrl.$inject = ['$scope', '$element', '$attrs'];
function questionEditorCtrl($scope, $element, $attrs) {
  let $editor = this;

  $scope.question = {
    purpose : {
      testing: false,
      exercise: false
    },
    tags : {},
    categories: {},
    saveForLater: null, // if it is labeled, {taggedTime: ..., }
    created_ts: null,
    updated_ts: null
  };

  $editor.addToKnowledge = function(category) {
    category = angular.copy(category);
    category.taggedTime = new Date();
    $scope.question.categories[category.label] = category;
  };

  $editor.addTag = function(tag) {
    tag = angular.copy(tag);
    tag.taggedTime = new Date();
    $scope.question.tags[tag.label] = tag;
  };

  $editor.saveForLater = function(tag) {
    let question = $scope.question;
    if (!question.saveForLater) {
      question.saveForLater = {
        taggedTime: new Date()
      };
    } else {
      question.saveForLater = null;
    }
  };

  $scope.questionStyles = ['基础题', '看图题', '综合题'];

  $scope.availableCategories = {
    '主类A/子类A1': {
      pinyinAliases: []
    },
    '主类A/子类A2': {},
    '主类B/子类B1': {},
    '主类B/子类B2': {},
  };


  $scope.availableTags = {
    '标签A': {
      pinyinAliases: []
    },
    '标签B': {
      pinyinAliases: ['bqB', 'biaoqianB']
    },
    '标签C': {
      pinyinAliases: []
    },
    '标签D': {
      pinyinAliases: []
    },
  };

}


app.directive('questionEditor', questionEditor);
questionEditor.$inject = ['$templateRequest', '$compile', '$timeout'];
function questionEditor($templateRequest, $compile, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    require: ['?ngModel', 'questionEditor',],
    scope: {
      src: '=',
      // mode: '='
    },
    templateUrl: 'app/comp/markdown/directives/editor.html',
    controller: 'questionEditorCtrl',
    controllerAs: '$editor',
    link: function($scope, $element, $attrs, ctrls) {
      let [ngModelCtrl, $editor] = ctrls;
      console.log(ngModelCtrl, $editor);

      let elm = $element.find(".markdown-editor");
      //
      let aceEditor = window.ace.edit(elm[0]);
      // aceEditor.setOption('fontFamily', 'monospace');
      // aceEditor.setOption('fontSize', '14px');

      let aceSession = aceEditor.getSession();
      elm.on('$destroy', function () {
        aceEditor.session.$stopWorker();
        aceEditor.destroy();
      });

      if (ngModelCtrl) {
        ngModelCtrl.$formatters.push(function (value) {
          if (angular.isUndefined(value) || value === null) {
            return '';
          }
          else if (angular.isObject(value) || angular.isArray(value)) {
            throw new Error('ACE不能编辑对象或数组');
          }
          $editor.preview = value;

          return value;
        });

        ngModelCtrl.$render = function () {
          // console.log(335555, ngModelCtrl.$modelValue,  ngModelCtrl.$viewValue)
          // $editor.preview = ngModelCtrl.$viewValue;
          aceSession.setValue(ngModelCtrl.$viewValue);
        };

        let beNotInDebounce = true;

        aceSession.on('change', function (e) {
          let newValue = aceSession.getValue();
          if (newValue !== ngModelCtrl.$viewValue &&
             !$scope.$$phase && !$scope.$root.$$phase) {

            if (beNotInDebounce) { // 在防抖处理中不接受任何变化
              beNotInDebounce = false;
              $timeout(function(){
                $editor.preview = aceSession.getValue();
                beNotInDebounce = true;
              }, 300);
            }

            $scope.$evalAsync(function () {
              ngModelCtrl.$setViewValue(newValue);
            });
          }
        });
      }


      // console.log(el, el.length);
      // angular.element(el[0]).html("<b>dddd</b>")

      // if ($attrs.src) { // 从变量读取
      //   $scope.$watch('src', function(newValue, oldValue) {
      //     renderMarkdownContent(newValue);
      //   });
      // }

    }
  }
}
