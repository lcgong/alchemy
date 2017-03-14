(function() {
  'use strict';
  var app = angular.module('mainapp');

  app.directive('loadingArea', function() {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
        var loadingLayer = angular.element('<div class="loading"></div>');
        element.append(loadingLayer);
        element.addClass('loading-area');
        scope.$watch(attrs.loadingArea, function(value) {
          console.log('loadding', value)
          loadingLayer.toggleClass('ng-hide', !value);
        });
      }
    };
  });

  app.directive('noContentHint', function() {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
        var loadingLayer = angular.element('<div class="no-content">（无内容）</div>');
        element.append(loadingLayer);
        element.addClass('no-content-hint');
        scope.$watch(attrs.noContentHint, function(value) {
          console.log('noContentHint', value)
          loadingLayer.toggleClass('ng-hide', !value);
        });
      }
    };
  });


  /** 客户资源清单筛选控制条指令
   */
  app.directive('listPager', function() {
    return {
      restrict: 'EA',
      replace: false,
      templateUrl: 'app/comp/list-pager.html',
      scope: {
        'params': '=',
      },
      controller: 'ListPagerCtrl'
    };
  });

  app.controller('ListPagerCtrl', function($scope, $parse, $element, $attrs, $filter, $q) {
    // console.log('list-pager params: ', $scope.params);

    if (!angular.isDefined($scope.params.span)) {
      $scope.params.span = [{
        id: 'M',
        title: '按月',
        name: '月'
      }, {
        id: 'Q',
        title: '按季',
        name: '季'
      }, {
        id: 'Y',
        title: '按年',
        name: '年'
      }];
    }

    if (!angular.isDefined($scope.params.tags)) {
      $scope.params.tags = [];
    }

    $scope.params.finish = function(next) { // success
      $scope.params.loading = false;

      // console.log('finish', next, $scope.pageNo, $scope.loadingPageNo);
      if (next) { // 新加载的页有数据，还可以尝试下一页
        $scope.pageNo = $scope.loadingPageNo;
      }
    };

    $scope.params.refresh = function() {
      $scope.turn(0);
    };

    // 计算月份的先前或向后偏移的日期
    var addMonths = function(date, offset) {
      var dt = new Date(date);
      dt.setMonth(dt.getMonth() + offset);

      if (dt.getDate() < date.getDate()) {
        // 若月份天数小于原来的，剩余的天数会自动累加下一个月
        dt.setDate(0); // 等价于设置上个月最后一天
      }
      return dt;
    };

    var formatSpanPage = function(spanId, pageNo) {

      var offset;
      if (spanId == 'M') {
        offset = -1;
      } else if (spanId == 'Q') {
        offset = -3;
      } else if (spanId == 'Y') {
        offset = -12;
      } else {
        console.error('unkown time span:', span);
        offset = -1;
      };

      var limit = 250;
      var format = $filter('date');
      var thisDate = new Date();
      var fromDate = addMonths(thisDate, offset * pageNo);
      var toDate = addMonths(thisDate, offset * (pageNo - 1));

      // 注意此处的页码和qcmd的页码不一致
      var fields = [
        format(fromDate, 'yyyyMMdd'), '-',
        format(toDate, 'yyyyMMdd')
        // ';', 'limit=', limit, ',', 'page=', 1
      ];

      return fields.join('');
    }

    $scope.getTitle = function() {
      var title;
      if ($scope.pageNo == 1) {
        title = '本' + $scope.span.name + '内';
      } else {
        title = '前第' + $scope.pageNo + '个' + $scope.span.name;
      }
      return title;
    };

    $scope.turn = function(step) {
      if ($scope.params.loading) {
        return; // 避免重复加载数据
      }

      console.log($scope.pageNo);

      $scope.params.loading = true;
      $scope.loadingPageNo = $scope.pageNo + step;
      $scope.params.qcmd = formatSpanPage($scope.span.id, $scope.loadingPageNo);
      $scope.params.load($scope.params.qcmd);

    };

    $scope.setTimeSpan = function(span) {
      if ($scope.span != span) {
        $scope.span = span;
        $scope.pageNo = 1;
        $scope.menu.isopen = false;
        $scope.turn(0);
      }
    };

    // 由外界的控制这个变量，在加载中时所有的组件为不可用状态，避免重复加载
    $scope.params.loading = false;

    // 查询跨度
    $scope.span = $scope.params.span[1];

    // 页码
    $scope.pageNo = 1;

    $scope.turn(0);
  });


})();
