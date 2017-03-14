(function() {
  'use strict';

  //---------------------------------------------------------------------------
  angular.module('mainapp').run(initialize);
  initialize.$inject = ['CodeManager'];
  function initialize(CodeManager) {
    CodeManager.register('host_class', {
      code_field: "id",
      title_field: "title"
    }, [
      {
        id: 'P',
        title: '飞机'
      },
      {
        id: 'D',
        title: '发动机'
      },
    ]);
  }

  //---------------------------------------------------------------------------
  angular.module('mainapp').factory('CodeManager', CodeManager);
  CodeManager.$inject = ['$http', '$q', '$timeout', 'restcli'];
  function CodeManager($http, $q, $timeout, restcli) {

    var options = {};

    var codeLists = {}; // {dict_name: [{code:, ...}, ...] }
    var codeDicts = {}; // {dict_name: {code:{}} }

    return {
      register: register,
      makeFinder: makeFinder,
      getCodeList: getCodeList,
      getCodeDict: getCodeDict,
      normalizer: normalizer,
      getConfiguration: getConfiguration,
      dirty: dirty
    }

    /**
     * @example
     * register('dict1', {
     *   code_field: 'id',
     *   title_field: 'name1',
     *   searchable: ['name1', 'name2'],
     *   load : function() { return data_or_promises; }
     * })
     */
    function register(dict_name, config, data) {

      if (angular.isUndefined(config.searchable)) {
        config.searchable = ['code', 'title'];
      }

      // var founded = false;
      // for (var i = 0, len = config.searchable; i < len; i++) {
      //   if (config.searchable[i] == '_pinyinKeywords') {
      //     founded = true;
      //     break;
      //   }
      // }
      // if (!founded) {
      //   config.searchable.push('_pinyinKeywords')
      // }

      options[dict_name] = angular.extend({}, config);
      reloadCodeList(dict_name, data);
    }

    /** 加载数据 */
    function reloadCodeList(dict_name, data) {

      if (!(dict_name in options)) {
        console.warn("无" + dict_name + "代码字典的配置");
        return [];
      }

      console.log('code-dict reloaded: ' + dict_name);

      var config = getConfiguration(dict_name);
      var title_field = config.title_field;
      var code_field = config.code_field;
      var searchable = config.searchable;

      if (!angular.isDefined(data)) {
        if (angular.isFunction(config.load)) {
          data = config.load(dict_name);
        } else {
          throw "没有指定代码数据或定义加载数据的途径";
        }
      }

      var promise = $q.when(data).then(function(data) {
        var codelist = [];

        for (var i = 0, len = data.length; i < len; i++) {

          var item = angular.extend({}, data[i]); // 复制对象

          // // 对各搜索项目生成拼音搜索项目_pinyinKeywords
          // if (angular.isArray(item.searchable) && item.searchable > 0) {
          //   item._pinyinKeywords = item.searchable
          //     .map(function(n) {
          //       return item[n]
          //     })
          //     .map(function(s) {
          //       return pywords(s)
          //     })
          //     .join(';');
          // } else {
          //   item._pinyinKeywords = pywords(item[title_field])
          // }

          codelist.push(item);
        }

        codeLists[dict_name] = codelist;

        return codelist;
      });

      return promise;
    }

    function getConfiguration(dict_name) {

      var config = options[dict_name];
      return angular.isDefined(config) ? config : {};
    }

    function getCodeList(dict_name, normlized) {

      if (normlized === true) {
        var normlize = normalizer(dict_name);
        var config = getConfiguration(dict_name);
        var code_field = config.code_field;

        if (dict_name in codeLists) {
          var list = codeLists[dict_name];
          var newlist = [];
          for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            newlist.push(normlize(item));
          }

          return newlist;
        }

        return $q.when(reloadCodeList(dict_name)).then(function(list) {
          var newlist = [];
          for (var i = 0, len = list.length; i < len; i++) {
            newlist.push(normlize(list[i]));
          }

          return newlist;
        });

      }

      if (dict_name in codeLists) {
        return codeLists[dict_name];
      }

      return reloadCodeList(dict_name);
    }

    function normalizer(dict_name) {
      var config = getConfiguration(dict_name);
      var code_field = config.code_field;
      var title_field = config.title_field;

      return function(code_obj, code) {
        if (angular.isDefined(code_obj)) {
          return {
            code: code_obj[code_field],
            title: code_obj[title_field],
            // _pinyinKeywords: code_obj._pinyinKeywords
          }
        } else {
          return {
            code: code
          }
        }
      }
    }

    function getCodeDict(dict_name) {
      if (dict_name in codeDicts) {
        return codeDicts[dict_name];
      }

      // 将列表转换为字典
      var code_field = getConfiguration(dict_name).code_field;

      return $q.when(getCodeList(dict_name)).then(function(list) {
        var dict = {};
        for (var i = 0, len = list.length; i < len; i++) {
          var item = list[i];
          dict[item[code_field]] = item;
        }
        codeDicts[dict_name] = dict;

        // console.log("Code dictionary '%s' loaded", dict_name);
        return dict;
      });
    }

    /** 产生字典dict_name的查询函数function(code)
     * var finder = makeFinder(dict_name, true);
     * 当title_fiele为true，返回的是title，当false时是代码对象
     */
    function makeFinder(dict_name, only_title) {

      var invoked = false;
      var code_dict = null;
      var config = getConfiguration(dict_name);
      var title_field = config.title_field || 'title';

      getCodeDict(dict_name);

      return function(code) {


        code_dict = getCodeDict(dict_name);

        if (code_dict == null || angular.isFunction(code_dict.then)) {
          return code;
        }

        if (only_title == true) { // 仅返回标题
          var code_obj = code_dict[code];
          if (angular.isObject(code_obj)) {
            var value = code_obj[title_field]
            if (typeof value !== 'undefined') {
              return value;
            }
          }

          return code;
        }

        // 按对象返回
        return code_dict[code];
      }
    }

    function dirty(dictName) {
      $timeout(function() {
        delete codeLists[dictName];
        delete codeDicts[dictName];
        console.log("Code dictionary '%s' removed", dictName);
      }, 0);
    }
  }

  /**
   * @example {{ user | code_title: 'user'  }}
   */
  angular.module('mainapp').filter('code_title', code_title);
  code_title.$inject = ['CodeManager', '$q'];
  function code_title(CodeManager, $q) {

    var lookup = null;

    return function(obj_or_array, dict_name) {

      if (lookup == null) {
        $q.when(CodeManager.makeFinder(dict_name, true), function(finder) {
          lookup = finder;
        });
        return obj_or_array;
      } else {
        lookup(obj_or_array);
      }

      if (!angular.isDefined(lookup)) {
        return obj_or_array;
      }

      if (!angular.isArray(obj_or_array)) {
        var value = lookup(obj_or_array);
        return angular.isDefined(value) ? value : obj_or_array;
      }

      // var results = [];
      // for (var i = 0, len = obj_or_array.length; i < len; i++) {
      //   var value = lookup(obj_or_array);
      //   results.push(angular.isDefined(value) ? value : obj_or_array);
      // }

      return results;
    };
  }

  // /** 将中文转换成全拼、韵母缩写和首字母缩写，以逗号间隔 */
  // function pywords(s) {
  //
  //   if (!angular.isDefined(pinyin)) {
  //     console.warn('没有拼音模块');
  //     return '';
  //   }
  //
  //   return [
  //     [].concat(pinyin.pinyin(s, {
  //       style: pinyin.STYLE_NORMAL,
  //     })).join(''),
  //     [].concat(pinyin.pinyin(s, {
  //       style: pinyin.STYLE_INITIALS
  //     })).join(''),
  //     [].concat(pinyin.pinyin(s, {
  //       style: pinyin.STYLE_FIRST_LETTER
  //     })).join('')
  //   ].join(',');
  // }
})();
