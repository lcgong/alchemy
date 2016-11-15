angular.module('mainapp').factory('ReposModel', ReposModel);
ReposModel.$inject = ['restcli'];
function ReposModel(restcli) {

  var baseUrl = '/api/repos/{repos_sn}';

  return {
    listBriefs: function list(params) {
        var url = '/api/repos/list/brief/{source}';

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

    listQuestionStyles: function(repos_sn) {
      let url = baseUrl + '/queststyles'
      return restcli.factory('GET', url)({
        pathargs: {
          repos_sn: repos_sn
        }
      });
    },
    //
    listTags: function(repos_sn) {
      let url = baseUrl + '/tags'
      return restcli.factory('GET', url)({
        pathargs: {
          repos_sn: repos_sn
        }
      });
    },
    //
    listCategories: function(repos_sn) {
      let url = baseUrl + '/categories'
      return restcli.factory('GET', url)({
        pathargs: {
          repos_sn: repos_sn
        }
      });
    },
    addTags: function(obj) {
        var url =  baseUrl + '/tags';
        return restcli.factory('POST', url)({
          pathargs: {
            repos_sn: obj.repos_sn
          },
          data: obj
        });
    },
    addQuestionStyles: function(obj) {
        var url = baseUrl + '/queststyles';
        return restcli.factory('POST', url)({
          pathargs: {
            repos_sn: obj.repos_sn
          },
          data: obj
        });
    },
    updateCategoryText: function(obj) {
        var url = baseUrl + '/categories';
        return restcli.factory('POST', url)({
          pathargs: {
            repos_sn: obj.repos_sn
          },
          data: obj
        });
    },
    removeTag: function(obj) {
        var url =  baseUrl + '/tags/{label_sn}';
        return restcli.factory('DELETE', url)({
          pathargs: {
            repos_sn: obj.repos_sn,
            label_sn: obj.label_sn,
          },
          data: obj
        });
    },
    removeQuestionStyle: function(obj) {
        var url =  baseUrl + '/queststyles/{label_sn}';
        return restcli.factory('DELETE', url)({
          pathargs: {
            repos_sn: obj.repos_sn,
            label_sn: obj.label_sn,
          },
          data: obj
        });
    },
    removeCategory: function(obj) {
        var url =  baseUrl + '/categories/{label_sn}';
        return restcli.factory('DELETE', url)({
          pathargs: {
            repos_sn: obj.repos_sn,
            label_sn: obj.label_sn,
          },
          data: obj
        });
    },
  };






}
