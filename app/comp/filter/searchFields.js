"use strict";
var app = angular.module('mainapp');


/**
 * 过滤器，条件如{name: a, age:20}，表示或的关系
 */
//filterOr
app.filter('searchFields', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();

          var val = item[prop];
          if (angular.isDefined(val) && val !== null && angular.isDefined(val.toString)) {
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
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});
