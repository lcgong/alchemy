"use strict";
var app = angular.module('mainapp');


/** 在对象指定字段里搜索
 * @example obj | search-in : ['name', 'code']
 */
app.filter('searchIn', searchIn);

function searchIn() {
  return function(items, fields, text) {
    var out = [];

    if (angular.isUndefined(items)) {
      return [];
    }

    if (!angular.isString(text) || text.trim().length == 0) {
      return items;
    }

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < fields.length; i++) {
          var prop = fields[i];

          var val = item[prop];
          if (angular.isDefined(val) && val !== null &&
            angular.isDefined(val.toString)) {

            if (val.toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      out = items;
    }

    return out;
  };
}
