// /*global jasmine, __karma__, window*/
Error.stackTraceLimit = 0; // "No stacktrace"" is usually best for app testing.

// Uncomment to get full stacktrace output. Sometimes helpful, usually not.
// Error.stackTraceLimit = Infinity; //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

__karma__.loaded = function () { };

console.log('args: ' + __karma__.config.args);

function isSpecFile(path) {
  return /\.spec\.ts$/.test(path);
}

let allSpecFiles = Object.keys(window.__karma__.files)
  // .filter(isSpecFile).map(s => s.replace(/base\/build\/app/, "app"));
  .filter(isSpecFile).map(s => s.replace(/base\/app/, "app"));

for (let f of allSpecFiles) {
  console.log('spec: ' + f);
}

System.import('reflect-metadata')
  .then(System.import('shim'))
  .then(System.import('zone.js/dist/zone'))
  .then(System.import('zone.js/dist/long-stack-trace-zone'))
  .then(System.import('zone.js/dist/proxy'))
  .then(System.import('zone.js/dist/sync-test'))
  .then(System.import('zone.js/dist/jasmine-patch'))
  .then(System.import('zone.js/dist/async-test'))
  .then(System.import('zone.js/dist/fake-async-test'))
  .then(initTestBed)
  .then(initTesting)
  ;


function initTestBed() { // 初始化测试组件的测试床
  return Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ])
  .then(function (providers) {
    let [coreTesting, browserTesting] = providers;

    coreTesting.TestBed.initTestEnvironment(
      browserTesting.BrowserDynamicTestingModule,
      browserTesting.platformBrowserDynamicTesting());
  })
}

function initTesting () { // 挨个测试所发现的测试用例spec
  return Promise.all(
    allSpecFiles.map(function (moduleName) {
      return System.import(moduleName).then(() => {
        // console.log('testing module: %s', moduleName);
      });
    })
  )
  .then(__karma__.start, __karma__.error);
}
