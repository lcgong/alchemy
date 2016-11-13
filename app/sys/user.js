(function() {
  'use strict';

  var app = angular.module('mainapp');

  app.config(['$stateProvider', function($stateProvider) { // 配置路由规则

    $stateProvider.state('user', {
      url: "/user",
      template: '<div class="list-detail-view" ui-view >无页面</div>'
    });

    $stateProvider.state('user.list', {
      url: '/list',
      templateUrl: 'app/sys/user_list.html'
    });

    $stateProvider.state('user.detail', {
      url: '/detail/{user_sn}',
      templateUrl: 'app/sys/user_detail.html'
    });
  }]);

  angular.module('mainapp').factory('UserModel', UserModel);
  UserModel.$inject = ['$injector', 'restcli'];
  function UserModel($injector, restcli) {

    var url = '/api/sys/user/{user_sn}';

    return {
      list: list,
      create: create,
      get: get,
      remove: remove,
      save: save,
    };

    function list(params) {
      var url = '/api/sys/user/';
      return restcli.factory('GET', url)({
        pathargs: {
        },
        page: params._page
      });
    }

    function get(user_sn) {
      console.log(111, user_sn)
      return restcli.factory('GET', url)({
        pathargs: {
          user_sn: user_sn
        }
      });
    }

    function create(obj) {
      return restcli.factory('POST', url)({
        pathargs: {
          user_sn: ''
        },
        data: obj
      }).then(function(data) {
        return data;
      });
    }

    function save(obj) {
      return restcli.factory('PUT', url)({
        pathargs: {
          user_sn: obj.user_sn
        },
        data: obj
      }).then(function(data) {
        return data;
      });
    }

    function remove(obj) {
      return restcli.factory('DELETE', url)({
        pathargs: {
          user_sn: obj.user_sn
        }
      }).then(function(data) {
        return data;
      });
    }
  }

  angular.module('mainapp').controller('UserListCtrl', UserListCtrl);
  UserListCtrl.$inject = ['$scope', '$q', '$state', 'UserModel', 'util'];
  function UserListCtrl($scope, $q, $state, UserModel, util) {

    var ctrl = this;

    ctrl.selected = [];
    ctrl.displayed = [];
    ctrl.isLoading = false;

    ctrl.pipe = function(tableState, tableCtrl) {

      ctrl.isLoading = true;

      var params = util.encodeSTPageRequest({}, tableState);

      UserModel.list(params).then(function(data) {
        ctrl.displayed = data;
        ctrl.isLoading = false;
        ctrl.selected.splice(0, ctrl.selected.length); // clear selected

        util.decodeSTPageResponse(data, tableState)
      }, function() {
        ctrl.isLoading = false;
      });
    }

    this.remove = function() {

      var items = ctrl.selected;

      var promises = [];
      for (var i = 0, len = items.length; i < len; i++) {
        promises.push(UserModel.remove(items[i]));
      }

      $q.all(promises).then(function(results) {
        util.notifySuccess('删除' + results.length + '条记录');
        ctrl.reloadTable();
      });
    };
  }


  // -------------------------------------------------------------------------
  angular.module('mainapp').controller('UserDetailCtrl', UserDetailCtrl);
  UserDetailCtrl.$inject = ['$scope', '$state', '$timeout', 'CodeManager',
    'UserModel', 'util'];
  function UserDetailCtrl($scope, $state, $timeout,
    CodeManager, UserModel, util) {

    var dtlctrl = this;
    $scope.editable = true;

    $scope.roles = [{
      id: 'sysuser',
      title: '系统用户'
    }, {
      id: 'sysadmin',
      title: '系统管理员'
    }, {
      id: '库管员',
      title: '库管员'
    }, {
      id: '检修员',
      title: '检修员'
    }];

    var roleDict = {};
    $scope.roles.forEach(function(item) {
      roleDict[item.id] = item;
    });

    $scope.model = {};
    $scope.model.user_sn = parseInt($state.params['user_sn'])
    if (isNaN($scope.model.user_sn)) {
      $scope.model.user_sn = 0;
    }

    dtlctrl.save = function() {
      var user = angular.copy($scope.model);

      for (var i = 0; i < user.sys_roles.length; i++) {
        var item = user.sys_roles[i];
        if (angular.isObject(user.sys_roles[i])) {
          user.sys_roles[i] = user.sys_roles[i].id;
        }
      }

      if (user.user_sn == 0) {
        UserModel.create(user).then(function(model) {
          var user = model[0];
          util.notifySuccess('创建成功');
          $state.go($state.current.name, {
            user_sn: user.user_sn
          });
        });

      } else {
        UserModel.save(user).then(function(model) {
          var model = model[0];
          util.notifySuccess('保存成功');
          dtlctrl.open();
        });
      }
    };

    dtlctrl.open = function() {
      if ($scope.model.user_sn == 0) {
        return;
      }

      UserModel.get($scope.model.user_sn).then(function(data) {

        var model = data[0];

        if (angular.isArray(model.sys_roles)) {
          // remove duplicated roles
          model.sys_roles = model.sys_roles.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
          });

          for (var i = 0; i < model.sys_roles.length; i++) {
            var role_id = model.sys_roles[i];
            var item = roleDict[role_id];
            if (angular.isUndefined(item)) {
              model.sys_roles[i] = {
                id: role_id,
                title: role_id
              };
            } else {
              model.sys_roles[i] = item;
            }
          }
        }

        if (model.user_sn == null) {
          model.user_sn = 0;
        }
        $scope.model = model;
        $timeout(function() {
          $scope.frm.$setPristine();
        }, 0);
      });
    }

    dtlctrl.changePassword = function() {
      $scope.userSession.changePassword({
        user_sn: $scope.model.user_sn
      });
    }

    $timeout(function() {
      dtlctrl.open();
    }, 0);
  }


})();
