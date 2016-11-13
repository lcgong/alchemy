(function() {
  "use strict";
  var app = angular.module('mainapp');

  // ------------------------------------------------------------------------
  app.factory('Fullscreen', FullscreenService)
  FullscreenService.$inject = ['$document', '$rootScope'];
  function FullscreenService($document, $rootScope) {

    var document = $document[0];

    var isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

    var emitter = $rootScope.$new();

    // listen event on document instead of element to avoid firefox limitation
    // see https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
    $document.on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
      emitter.$emit('FBFullscreen.change', serviceInstance.isEnabled());
    });

    var serviceInstance = {
      $on: angular.bind(emitter, emitter.$on),
      all: function() {
        serviceInstance.enable(document.documentElement);
      },
      enable: function(element) {
        if (element.requestFullScreen) {
          element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          // Safari temporary fix
          if (/Version\/[\d]{1,2}(\.[\d]{1,2}){1}(\.(\d){1,2}){0,1} Safari/.test(navigator.userAgent)) {
            element.webkitRequestFullscreen();
          } else {
            element.webkitRequestFullscreen(isKeyboardAvailbleOnFullScreen);
          }
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      },
      cancel: function() {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      },
      isEnabled: function() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        return fullscreenElement ? true : false;
      },
      toggleAll: function() {
        serviceInstance.isEnabled() ? serviceInstance.cancel() : serviceInstance.all();
      },
      isSupported: function() {
        var docElm = document.documentElement;
        var requestFullscreen = docElm.requestFullScreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullscreen || docElm.msRequestFullscreen;
        return requestFullscreen ? true : false;
      }
    };

    return serviceInstance;
  }

  //-------------------------------------------------------------------------
  app.directive('fullscreenAll', fullscreenAllDirective);
  fullscreenAllDirective.$inject = ['$q'];
  function fullscreenAllDirective($q) {
    return {
      restrict: 'EA',
      replace: true,
      template: `<a href="" ng-click="ctrl.toggleFullscreen()">
                 <span class="glyphicon glyphicon-fullscreen"  uib-tooltip="全屏切换"
                 tooltip-placement="bottom"
                 tooltip-popup-delay="200"></span>
                 </a>`,

      controller: 'fullscreenAllCtrl',
      controllerAs: 'ctrl',
    };
  }

  app.controller('fullscreenAllCtrl', fullscreenAllCtrl)
  fullscreenAllCtrl.$inject = ['$scope', '$timeout', 'Fullscreen'];
  function fullscreenAllCtrl($scope, $timeout, Fullscreen) {
    var ctrl = this;

    ctrl.toggleFullscreen = function() {
      Fullscreen.toggleAll();
    }
  }
})();
