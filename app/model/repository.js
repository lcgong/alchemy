

//===========================================================================
// angular.module('mainapp').factory('Repository', Repository);

// import {app} from 'app/main';
//
//
//
// app.service('Repository', Repository);
// Repository.$inject = ['$http'];
// function Repository($http) {
//
//   var base_url = '/api/fl/journal';
//
//
//   // return {
//   //   listHostJournal: listHostJournal,
//   //   get: get,
//   //   remove: remove,
//   //   create: create,
//   //   save: save
//   // };
// }
// function Repository(restcli) {
//
//   var base_url = '/api/fl/journal';
//
//   return {
//     listHostJournal: listHostJournal,
//     get: get,
//     remove: remove,
//     create: create,
//     save: save
//   };
//
//   function listHostJournal(params) {
//     var url = base_url + '/host/{host_sn}';
//
//     return restcli.factory('GET', url)({
//       pathargs: {
//         host_sn: params.host_sn
//       },
//       page: params._page
//     });
//   }
//
//   function create(obj) {
//     var url = base_url + '/host/{host_sn}';
//     return restcli.factory('POST', url)({
//       pathargs: {
//         host_sn: obj.host_sn
//       },
//       data: obj
//     });
//   }
//
//   function get(am_receipt_sn) {
//     var url = base_url + '/{journal_sn}';
//
//     return restcli.factory('GET', url)({
//       pathargs: {
//         journal_sn: params.journal_sn
//       }
//     });
//   }
//
//   function save(obj) {
//
//     var url = base_url + '/{journal_sn}';
//     return restcli.factory('PUT', url)({
//       pathargs: {
//         journal_sn: obj.journal_sn
//       },
//       data: obj
//     });
//   }
//
//   function remove(obj) {
//     var url = base_url + '/{journal_sn}';
//     return restcli.factory('DELETE', url)({
//       pathargs: {
//         journal_sn: obj.journal_sn
//       }
//     });
//   }
// }
