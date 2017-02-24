'use strict';

var app = angular.module('mainapp');

app.factory('RouteHistory', RouteHistory);
RouteHistory.$inject = [];

function RouteHistory() {

  var historyMaxLength = 200; // 历史队列的最大长度
  var historyStorageId = 'routeHistoryList';

  return {
    mark: mark,
    getPreviousView: previousView
  };

  function previousView(level) {

    if (!angular.isNumber(level)) {
      level = 10000; // maxium level of route path.
    }

    var history = loadHistory();

    if (history.length == 0) {
      return null;
    }

    var curItem = history[history.length - 1];
    var curLvls = curItem.name.split('.')

    for (var prevIdx = history.length - 2; prevIdx >= 0; prevIdx--) {
      var prevItem = history[prevIdx];
      var prevLvls = prevItem.name.split('.');


      // 从顶层开始，找到不同层次
      var n = Math.min(curLvls.length, prevLvls.length);
      var unmatched = null;
      for (var j = 0; j < n; j++) {
        if (prevLvls[j] != curLvls[j]) {
          unmatched = j;
          break;
        }
      }

      // console.log(3333, curLvls, prevLvls, 'co: ', unmatched);

      // a.b.c -> a.c.d,  a.b -> a.b.c,
      if (unmatched != null && unmatched <= level) {
        return prevItem;
      }
    }

    return null;
  }

  /* 登记历史位置， 地址名name, 参数params */
  function mark(name, params) {

    var history = loadHistory();

    if (history.length > 0) {
      var head = history[history.length - 1];
      if (head.name == name) { // 如果同一个视图，则仅更新新参数
        head.params = angular.copy(params);

        saveHistory(history);
        return;
      }
    }

    history.push({
      name: name,
      params: angular.copy(params)
    });

    if (history.length == historyMaxLength) {
      history.shift();
    }

    saveHistory(history);
  }


  function loadHistory() {
    var history = sessionStorage.getItem(historyStorageId);
    if (angular.isString(history)) {
      history = angular.fromJson(history);
    }
    // console.log(4444, history);

    if (!angular.isArray(history)) {
      history = [];
    }

    // console.log('load %o', sessionStorage.getItem(historyStorageId));

    return history;
  }

  /** 存储历史位置 */
  function saveHistory(history) {
    if (!angular.isArray(history)) {
      history = [];
    }

    sessionStorage.setItem(historyStorageId, angular.toJson(history));

    // console.log('save %o', sessionStorage.getItem(historyStorageId));

  }
}



//-------------------------------------------------------------------------
app.run(setupEventHandler);
setupEventHandler.$inject = ['$rootScope', 'RouteHistory'];

function setupEventHandler($rootScope, RouteHistory) {

  // 监听route状态的切换事件，标记历史
  $rootScope.$on('$stateChangeSuccess',
    function(ev, to, toParams, from, fromParams) {

      RouteHistory.mark(to.name, toParams);
    });
}
