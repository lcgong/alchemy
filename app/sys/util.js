"use strict";
var app = angular.module('mainapp');

//---------------------------------------------------------------------------
app.factory('util', util);
util.$injector = ['$injector', '$http', 'ConfirmDialog'];

function util($injector, $http, ConfirmDialog) {
  return {
    format: format,
    encodeSTPageRequest: encodeSTPageRequest,
    decodeSTPageResponse: decodeSTPageResponse,
    notifySuccess: notifySuccess,
    fail: fail,
    download: download
  };

  /** Format a string.
   * util.format('hi, {name}', {name:'Tom'})
   */
  function format(tmpl, args) {
    return tmpl.replace(/{([^}]*)}/g, function(match, name) {
      if (angular.isDefined(args[name])) {
        return args[name];
      } else {
        return null;
        // throw "'" + tmpl + "'无" + name + "匹配变量"
      }
    });
  }

  /*生成smarttable的DPage请求*/
  function encodeSTPageRequest(obj, tableState) {
    var start = tableState.pagination.start || 0;
    var number = tableState.pagination.number || 25;
    var end = start + number - 1;

    var sortable = [];
    if (angular.isString(tableState.sort.predicate)) {
      sortable.push(((tableState.sort.reverse) ? '-' : '+') +
        tableState.sort.predicate);
    }

    obj._page = {
      start: start,
      limit: number,
      sortable: sortable
    };

    return obj;
  }

  function decodeSTPageResponse(data, tableState) {
    if (!angular.isObject(data._page)) {
      return;
    }

    var start = data._page.start;
    var limit = data._page.limit;

    var numberOfItemPerPage = tableState.pagination.number || 25;
    var numberOfPages = 1 + Math.trunc(start / numberOfItemPerPage);

    if (data.length < tableState.pagination.number) {
      tableState.pagination.numberOfPages = numberOfPages;
    } else {
      tableState.pagination.numberOfPages = numberOfPages + 1;
    }
  }

  function notifySuccess(message) {
    var Notifier = $injector.get('Notifier');
    return Notifier.success(message);
  }

  function fail(message) {
    var Notifier = $injector.get('Notifier');
    return Notifier.fail(message);
  }

  function download(url, config) {
    var headers = {};
    var method = "GET";
    var data;
    var params = {};

    if (angular.isObject(config)) {
      if (angular.isString(config.method)) {
        method = config.method;
      }

      if (angular.isString(config.searchtext)) {
        params.searchtext = config.searchtext;
      }

      if (angular.isObject(config.pathargs)) {
        var pathargs = config['pathargs'];
        url = util.format(url, pathargs)
      }

      data = config.data
      angular.extend(params, config.params);
    }


    return $http({
      url : url,
      method : method,
      data : data,
      params: params,
      responseType : 'arraybuffer'
    }).success(function(data, status, headers, config) {
      var contentType = headers('Content-Type');
      var disposition = headers('Content-Disposition');

      // 从Content-Disposition解析出文件名，应解析采用UTF-8编码的文件名
      var filename;
      var matched = /filename\*=UTF-8\'\'(.*)\"/.exec(disposition);
      if (matched != null) {
        filename = decodeURI(matched[1]);
      }

      var file = new Blob([ data ], {
        type : contentType
      });

      // 创建一个A元素，仿造点击链接下载
      var el = document.createElement('A');
      el.href = URL.createObjectURL(file);
      el.target = '_blank';
      el.download = filename;
      document.body.appendChild(el);
      el.click();
      document.body.removeChild(el);
     });
  }
}
