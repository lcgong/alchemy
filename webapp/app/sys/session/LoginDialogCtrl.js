'use strict';
var app = angular.module('mainapp');

app.controller('LoginDialogCtrl', LoginDialogCtrl);
LoginDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'UserSessionModel'];

function LoginDialogCtrl($scope, $uibModalInstance, UserSessionModel) {
  // 登录框背景幻灯片定义及切换时长(毫秒)
  $scope.slideInterval = 5000;
  $scope.slides = [{
    image: '/images/login_slides/S01.jpg',
    title: '',
    notes: ''
  }, {
    image: '/images/login_slides/S02.jpg',
    title: '',
    notes: ''
  }];

  for (var i = $scope.slides.length - 1; i >=0; i--) {
    $scope.slides[i].id = i;
  }

  $scope.active = 1;

  // ModalDialog创建后还会创建一个子scope，为了利用继承机制，需要在父scope创建一个空的对象
  $scope.form = {};

  // 用户名密码录入登录窗格
  $scope.alerts = [{
    type: 'danger',
    msg: 'abc'
  }];
  $scope.alerts = [];

  $scope.showAlert = function(msg, level) {
    if (level == undefined) {
      level = 'danger';
    }
    if (msg == null || msg == undefined) {
      $scope.alerts = [];
    } else {
      $scope.alerts = [{
        type: level,
        msg: msg
      }];
    }

  }

  $scope.login = function() {

    UserSessionModel.login({
      principal: $scope.form.principal,
      //password : CryptoJS.SHA1($scope.form.password).toString()
      password: $scope.form.password
    }).then(function(user) {
      console.log('登录凭据(%s)登录成功，认证用户[%o].', $scope.form.principal, user);
      $uibModalInstance.close(user);
    }, function(response) {
      if (response.status == 401) {
        console.log('尝试使用%s认证失败: %o', $scope.principal, response);
        $scope.showAlert('认证失败，请重新检查登录名、密码是否匹配');
      } else {
        console.log('尝试使用%s登录失败，服务异常: %o', $scope.principal, response);
        $scope.showAlert('使用%s登录系统，但系统拒绝(' + response.status + ')');
      }
    });
  }

  $scope.ok = function() {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}
