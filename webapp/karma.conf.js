/* global module */
module.exports = function (config) {
	'use strict';
	config.set({
		autoWatch: true,
		singleRun: true,

		frameworks: ['jspm', 'jasmine'],

		basePath : '.',

		files: [
			'node_modules/babel-polyfill/dist/polyfill.js'
		],

		exclude : [
			'jspm_packages/github/mathjax/**/*.*'
		],

		jspm: {
			config: 'app/jspm.config.js',
			loadFiles: [
				'app/**/*.spec.js'
			],
			serveFiles: [
				'app/**/!(*spec).js'
			]
		},

		browsers: ['PhantomJS'],

		preprocessors: {
			'app/!(*spec).js': ['babel'] //, 'sourcemap', 'coverage']
		},

		babelPreprocessor: {
			options: {
				sourceMap: 'inline'
			},
			sourceFileName: function(file) {
				return file.originalPath;
			}
		},

		singleRun: true,

		// reporters: ['coverage', 'progress'],

		// coverageReporter: {
		// 	instrumenters: {isparta: require('isparta')},
		// 	instrumenter: {
		// 		'app/**/*.js': 'isparta'
		// 	},
		//
		// 	reporters: [
		// 		{
		// 			type: 'text-summary',
		// 			subdir: normalizationBrowserName
		// 		},
		// 		{
		// 			type: 'html',
		// 			dir: 'coverage/',
		// 			subdir: normalizationBrowserName
		// 		}
		// 	]
		// }
	});

	function normalizationBrowserName(browser) {
		return browser.toLowerCase().split(/[ /-]/)[0];
	}
};
