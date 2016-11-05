
// var MarkdownIt = require('../../markdown-it');
// import md from "app/test/markdown"
// import angular from "angular"
//
// console.log(333, angular);

// // import MarkdownIt from "";
// require("../../jspm_packages/system-polyfills");
// var System = require("../../jspm_packages/system");
// require("../../app/jspm.config.js");
//
// // import d from 'markdown-it';
// // require('markdown-it')
//
// System.import('markdown-it').then(function(MarkdownIt) {
//   console.log(MarkdownIt);
// });

var sample =`\
> this is a
  dss
> The following is
`;

import MarkdownIt from "markdown-it";
import question_option from "app/comp/markdown/question";



var md = new MarkdownIt();
md.use(question_option);

var tokens = md.parse(sample, {});

console.log('\n', JSON.stringify(tokens, null, Number(4)));

// import systm from 'system.js'
// var System = require('../../jspm_packages/system.js');
// console.log(System)

// describe("A suite", function() {
//   it("contains spec with an expectation", function() {
//     expect(true).toBe(true);
//
//   });
// });
