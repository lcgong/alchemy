import "./notifier.css!";


let app = angular.module('mainapp');

app.service('Notifier', ['$rootScope', '$timeout', '$injector',
  function($rootScope, $timeout, $injector) {

    // notification 有两类消息，方便服务及相关组件使用
    // 如果重复的消息，自动合并且计数显示，避免太多信息而扰乱屏幕
    $rootScope.notification = {
      hints: [], // 提示信息，以弹出提示条的方式
      alerts: [], // 告知信息，以模式对话框的方式
      dialogPromise: null // 打开的模式对话框
    };

    var queue = null;


    // 推送提示消息 {type, message}
    var pushHint = function(item) {
      if (angular.isString(item)) {
        item = {
          type: 'info',
          message: item
        };
      }

      var hints = $rootScope.notification.hints;
      var countMark = 0; // 用计数标记消息的新旧
      for (var i = hints.length - 1; i >= 0; i--) {
        if (hints[i].type == item.type && hints[i].message == item.message) {
          // 找到相同内容的提示信息

          hints[i].count += 1;
          item = hints[i];
          countMark = item.count;
          break;
        }
      }

      if (countMark == 0) { // 新消息
        item.count = 0;
        hints.push(item);
      }

      $timeout(function() {
        if (countMark < item.count) {
          // 在该条消息之后，又有了新的消息
          return;
        }

        // 消息到期后删除
        var index = hints.indexOf(item);
        if (index != -1) {
          hints.splice(index, 1);
        }
      }, 2000);
    };

    var closeHint = function(item) {
      var hints = $rootScope.notification.hints;
      var index = hints.indexOf(item);
      if (index != -1) {
        hints.splice(index, 1);
      }
    };

    // // {type, title, message}
    var pushAlert = function(item) {
      var $uibModal = $injector.get('$uibModal');
      if (angular.isString(item)) {
        item = {
          type: 'warning',
          message: item
        };
      }


      if ($rootScope.notification.dialogPromise != null) {
        // 对话框已经已经打开

        var alerts = $rootScope.notification.alerts;
        var countMark = 0; // 用计数标记消息的新旧
        for (var i = alerts.length - 1; i >= 0; i--) {
          if (alerts[i].type == item.type && alerts[i].title == item.title && alerts[i].message == item.message) {
            // 找到相同内容的提示信息

            alerts[i].count += 1;
            item = alerts[i];
            countMark = item.count;
            break;
          }
        }

        if (countMark == 0) { // 新消息
          item.count = 0;
          alerts.push(item);
        }


        return $rootScope.notification.dialogPromise;
      }

      item.count = 0;
      $rootScope.notification.alerts.push(item);

      var dialog = $uibModal.open({
        templateUrl: 'app/comp/notifier-dialog.html',
        controller: 'NotifierDialogModalInstanceCtrl',
        keyboard: true, // 按ESC可退出
        backdrop: true, // 按背景也可退出
        // resolve: {}
      });

      var promise = dialog.result.then(function(conclusion) {
        // 告知对话框已经关闭，清除这些所有积攒的消息
        $rootScope.notification.dialogPromise = null;
        $rootScope.notification.alerts.length = 0;
        return conclusion;
      });

      $rootScope.notification.dialogPromise = promise;
      return promise;
    };


    return {
      success: function(msg) {
        pushHint({
          type: 'success',
          message: msg
        });
      },
      info: function(msg) {
        pushHint({
          type: 'info',
          message: msg
        });
      },
      error: function(msg) {
        pushHint({
          type: 'warning',
          message: msg
        });
      },
      fail: function(msg) {
        pushHint({
          type: 'danger',
          message: msg
        });
      },
      closeHint: closeHint,
      alert: pushAlert
    };
  }
]);

app.directive("notificationBar", function($q) {
  return {
    restrict: "AE",
    replace: true,
    scope: {},
    templateUrl: 'app/comp/notifier.html',
    controller: 'notificationBarCtrl'
  }
});

app.controller('notificationBarCtrl', ['$scope', '$rootScope', 'Notifier',
  function($scope, $rootScope, Notifier) {

    $scope.hints = $rootScope.notification.hints;
    $scope.close = function(item) {
      Notifier.closeHint(item);
    };
  }
]);


app.controller("NotifierDialogModalInstanceCtrl", ['$scope', '$rootScope', '$uibModalInstance',
  function($scope, $rootScope, $uibModalInstance) {


    $scope.alerts = $rootScope.notification.alerts;

    $scope.close = function() {
      $uibModalInstance.close();
    };
  }
]);
