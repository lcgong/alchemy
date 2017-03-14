module.exports = function(config) {

  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter')
    ],

    client: {
      args: ['--grep', (config.grep===true)? null : config.grep],
      clearContext: false // 在浏览器runner显示输出结果
    },

    files: [
      'jspm_packages/system.js',
      'webroot/jspm.config.js',
      'webroot/jspm.config.transpiler.js',
      'build/lib/rt.js',
      'build/lib/ts.transpiler.js',
      { pattern: 'jspm_packages/system.js.map)', included: false, watched: false },
      { pattern: 'build/lib/rt.js.map)', included: false, watched: false },
      { pattern: 'build/lib/ts.transpiler.js.map)', included: false, watched: false },

      // webapp程序
      { pattern: 'app/**/*.+(css|html)', included: false, watched: true },
      { pattern: 'app/**/*.ts', included: false, watched: true },
      // { pattern: 'build/app/**/*.+(js|js.map)', included: false, watched: true },

      'karma.bootstrap.js', // Karma在浏览器端启动脚本

      { pattern: 'jspm_packages/npm/**/*', included: false, watched: false },      

      // /base/jspm_packages/npm/@angular/core@2.4.8/bundles/core-testing.umd.js
      // { pattern: 'jspm_packages/npm/markdown-it/**/*.umd.+(js|js.map)', included: false, watched: false },
      // { pattern: 'jspm_packages/npm/@angular/**/*.umd.+(js|js.map)', included: false, watched: false },
      // { pattern: 'jspm_packages/npm/reflect-metadata@*/*.+(js|js.map)', included: false, watched: false },
      // { pattern: 'jspm_packages/npm/shim@*/**/*.+(js|js.map)', included: false, watched: false },
      // { pattern: 'jspm_packages/npm/zone.js@*/dist/**/*.+(js|js.map)', included: false, watched: false },

    ],

    proxies: {
      // '/app': '/base/build/app',
      '/app': '/base/app',
      '/jspm_packages/': '/base/jspm_packages/',
    },

    exclude: [],
    preprocessors: {},
    reporters: ['progress', 'kjhtml'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
}
