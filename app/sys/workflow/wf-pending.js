(function() {



  'use strict';


  app.controller('WfPendingPanelCtrl', function($scope, $q, $state, UserSession, WfPendingModel) {
    console.log('WfPendingPanelCtrl created');

    $scope.pending = [];

    var refresh = function() {
      $q.when(UserSession.user).then(function() {
        WfPendingModel.list().then(function(data) {
          $scope.pending = data;
        }, function() {});
      });
    };

    $scope.open = function(task) {
      console.log('open', task);
      if (task.obj_class == 'cr.dist') {
        $state.go("crdist.detail", {
          cr_dist_sn: task.obj_sn
        });
      } else if (task.obj_class == 'cr.reg') {
        $state.go("crreg.detail", {
          cr_reg_sn: task.obj_sn
        });
      } else if (task.obj_class == 'dfrm.form') {
        $state.go("dfrm.detail", {
          dfrm_sn: task.obj_sn
        });
      }
    };


    $scope.$watch('wfPendingBtn.isopen', function(newVal) {
      if (newVal) {
        refresh();
      }
    });
  });


})();
