angular.module('mainapp').factory('ReleaseModel', ReleaseModel);
ReleaseModel.$inject = ['restcli'];
function ReleaseModel(restcli) {

  var baseUrl = '/api/repos/{repos_sn}/release';

  return {
    // source: recent, saveforlater, all
    list: function(repos_sn, source) {
        let url = '/api/repos/{repos_sn}/quest/' + source;
        return restcli.factory('GET', url)({
          pathargs: {
            repos_sn: repos_sn
          }
        });
    },

    //
    getQuestion: function(quest_sn) {
        let url = baseUrl
        return restcli.factory('GET', url)({
          pathargs: {
            quest_sn: quest_sn
          }
        });
    },

    //
    create: function(quest) {
        var url = '/api/repos/{repos_sn}/quest/';
        return restcli.factory('POST', url)({
          pathargs: {
            repos_sn: quest.repos_sn,
          },
          data: quest
        });
    },

    //
    save: function (quest) {
      let url = baseUrl;
      return restcli.factory('PUT', url)({
        pathargs: {
          quest_sn: quest.quest_sn
        },
        data: quest
      });
    },

    //
    trash: quest_sn => {
      let url = baseUrl;
      return restcli.factory('DELETE', url)({
          pathargs: {
            quest_sn: quest_sn
          }
      });
    },
    listTrashedQuestions: quest_sn => {
      let url = '/api/repos/{repos_sn}/trashed';
      return restcli.factory('GET', url)({
          pathargs: {
            repos_sn: quest_sn
          }
      });
    },

    setSaveForLater: function(quest_sn, status) {
      let url = baseUrl + '/saveforlater';
      return restcli.factory('PUT', url)({
        pathargs: {
          quest_sn: quest_sn
        },
        data: {
          status: status
        }
      });
    },

    // target: tags or categories
    // return all of labels of this quest for this target
    updateLabels: function(quest_sn, target, labels ) {
      // labels = Object.keys(labels);

      let url = baseUrl + '/' + target;
      return restcli.factory('PUT', url)({
        pathargs: {
          quest_sn: quest_sn
        },
        data: labels
      });
    },
  };
}
