(function() {
  "use strict";
  var app = angular.module('mainapp');
  
  app.factory('SideBar', ['$rootScope', function($rootScope) {
    $rootScope.sidebar = {
      groups: [],
      items: {}
    };

    var define = function(grps, reverse) {
      if (!angular.isArray(grps)) {
        grps = [grps];
      }

      var groups = $rootScope.sidebar.groups;
      groups.length = 0; // clear all groups
      var items = $rootScope.sidebar.items;
      for (key in items) { // clear all items
        if (items.hasOwnProperty(key)) {
          delete items[key];
        }
      }


      if (!angular.isDefined(reverse)) {
        reverse = false;
      }

      // copy groups, items
      // items.name.item
      for (var i = grps.length; i >= 0; i--) {
        var grp = grps[i];
        if (angular.isUndefined(grp))
          continue;

        console.log(grp);

        groups.push(grp);
        if (reverse) {
          grp.reverse();
        }

        // 给按钮组装配visible属性，判断组内元素是否有visible的元素
        if (!grp.hasOwnProperty('visible')) {
          Object.defineProperty(grp, "visible", {
            get: function() {
              for (var i = this.length - 1; i >= 0; i--) {
                if (this[i].visible)
                  return true;
              };
              return false;
            }
          });
        }

        for (var j = grp.length - 1; j >= 0; j--) {
          var item = grp[j];
          items[item.name] = item;

          if (!item.hasOwnProperty('visible'))
            item.visible = true;

          if (!item.hasOwnProperty('disabled'))
            item.disabled = false;
        }
      }
    };

    return {
      define: define,

      get groups() {
        return $rootScope.sidebar.groups;
      },

      get items() {
        return $rootScope.sidebar.items;
      },
    };
  }]);

  app.controller("SideBarCtrl", ['$scope', 'SideBar', function($scope, SideBar) {
    // $scope.sidebar = $state.current.data.sidebar;

    $scope.groups = SideBar.groups;
    $scope.items = SideBar.items;
  }]);


  // <div compile="var" ></div>
  // 可以将给定的变量的模板编译为html
  app.directive('compile', function($compile) {
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
          return scope.$eval(attrs.compile);
        },
        function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        });
    };
  });


})();
