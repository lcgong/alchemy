/** 加载模板字符串， 保证controller和scope能够传递 */

let includeTemplateDirective = ['$anchorScroll', '$animate',
                  function($anchorScroll,   $animate) {
  return {
    restrict: 'A',
    priority: 400,
    terminal: true,
    transclude: 'element',
    controller: angular.noop,
    compile: function(element, attr) {

      var srcExp = attr.includeTemplate;
      var autoScrollExp = attr.autoscroll;

      return function(scope, $element, $attr, ctrl, $transclude) {
        let changeCounter = 0,
            currentScope,
            previousElement,
            currentElement;

        let cleanupLastIncludeContent = function() {
          if (previousElement) {
            previousElement.remove();
            previousElement = null;
          }
          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if (currentElement) {
            $animate.leave(currentElement).then(function() {
              previousElement = null;
            });
            previousElement = currentElement;
            currentElement = null;
          }
        };

        scope.$watch(srcExp, function includeTemplateWatchAction(src) {
          let afterAnimation = function() {
            if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
              $anchorScroll();
            }
          };

          let thisChangeId = ++changeCounter;

          if (src) {
            if (scope.$$destroyed) return;

            if (thisChangeId !== changeCounter) return;
            var newScope = scope.$new();
            ctrl.template = src;

            // Note: This will also link all children of ng-include that were contained in the original
            // html. If that content contains controllers, ... they could pollute/change the scope.
            // However, using ng-include on an element with additional content does not make sense...
            // Note: We can't remove them in the cloneAttchFn of $transclude as that
            // function is called before linking the content, which would apply child
            // directives to non existing elements.
            var clone = $transclude(newScope, function(clone) {
              cleanupLastIncludeContent();
              $animate.enter(clone, null, $element).then(afterAnimation);
            });

            currentScope = newScope;
            currentElement = clone;

          } else {
            cleanupLastIncludeContent();
            ctrl.template = null;
          }
        });
      };
    }
  };
}];

// This directive is called during the $transclude call of the first `includeTemplate` directive.
// It will replace and compile the content of the element with the loaded template.
// We need this directive so that the element content is already filled when
// the link function of another directive on the same element as includeTemplate
// is called.
let includeTemplateFillContentDirective = ['$compile', function($compile) {
    return {
      restrict: 'A',
      priority: -400,
      require: 'includeTemplate',
      link: function($scope, $element, $attr, ctrl) {

        $element.html(ctrl.template);

        if ($attr.onPrecompileFunc) {
          let func = $scope.$eval($attr.onPrecompileFunc);
          if (typeof func === 'function') {
            func($element);
          } else {
            console.warn('on-precompile-func should be a function');
          }
        }

        $compile($element.contents())($scope);
      }
    };
  }];

let app = angular.module('mainapp');

app.directive('includeTemplate', includeTemplateDirective);
app.directive('includeTemplate', includeTemplateFillContentDirective);
