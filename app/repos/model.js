angular.module('mainapp').factory('ReposModel', ReposModel);
ReposModel.$inject = ['restcli'];
function ReposModel(restcli) {

  var baseUrl = '/api/repos/{repos_sn}';

  return {
    listBriefs: function list(params) {
        var url = '/api/repos/brief/{source}';

        var config = {
          pathargs: {
            source: params.source
          },
          page: params._page
        };

        config.params = {}

        // if (angular.isNumber(params.repos_sn)) {
        //   config.params.repos_sn = params.repos_sn;
        // }

        return restcli.factory('GET', url)(config);
    },
    get_desc: function(repos_sn) {
        let url = baseUrl + '/desc'
        return restcli.factory('GET', url)({
          pathargs: {
            repos_sn: repos_sn
          }
        });
    },
    create: function(repos) {
        var url = '/api/repos/';
        return restcli.factory('POST', url)({
          data: repos
        });
    },
    //
    save: function (repos) {
        return restcli.factory('PUT', baseUrl)({
          pathargs: {
            repos_sn: repos.repos_sn
          },
          data: repos
        });
    },
    //
    removeRepos: function(repos_sn) {
        return restcli.factory('DELETE', baseUrl)({
          pathargs: {
            repos_sn: repos_sn
          }
        });
    },
  };






}
