"use strict";
var app = angular.module('mainapp');


app.factory('restcli', restcli);
restcli.$inject = ['$http', 'util'];

function restcli($http, util) {

  return {
    factory: factory
  };

  function factory(method, url) {

    var request_func = function(config) {
      var headers = {};
      var data;
      var params = {};

      if (angular.isObject(config)) {
        if (angular.isString(config.searchtext)) {
          params.searchtext = config.searchtext;
        }

        if (angular.isObject(config.pathargs)) {
          var pathargs = config['pathargs'];
          url = util.format(url, pathargs)
        }

        if (angular.isObject(config.page)) {
          var start = config['page'].start || 0;
          var limit = config['page'].limit || 25;
          var sortable = config['page'].sortable || [];

          // Range: items=0-24, sortable=+a,-b
          // [start, end]
          var range = 'items=' + start + '-' + (start + limit - 1);
          if (sortable.length > 0) {
            range += ', sortable=' + sortable.join(',');
          }
          headers['Range'] = range;
        }
        data = config.data
        angular.extend(params, config.params);
      }

      return $http({
        url: url,
        data: data,
        params: params,
        method: method,
        headers: headers,
        responseType: 'json'
      }).then(function(response) {
        var data = response.data;
        if (data == null) {
          data = [];
          return data;
        }
        // console.log(response.headers['Content-Range'],
        var range = response.headers('Content-Range');
        if (angular.isString(range)) {
          var matched = range.match(/items=(\d+)-(\d+)/);

          if (angular.isArray(matched)) {
            var start = parseInt(matched[1]);
            var end = parseInt(matched[2]);

            var limit = (end - start) + 1;

            data._page = {
              start: start,
              limit: limit
            };
            // TBD
          }
        }

        return data;
      });
    }

    return request_func;
  }
}
