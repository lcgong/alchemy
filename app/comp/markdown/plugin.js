'use strict';



/**

'''

大题，题目，子题


子题设置
###1 选择题 单选题 多选题 判断题 填空题 一行一项  一行两项 一行四项 固定

子题固定，在试卷生成中，子题的所在的位置不变，


选择题的选项：
(A):
(E, 固定, 独行):   可以用中英文符号混用 （,）


%%% 答案：(A) (B)

%%%

'''

*/


var parseQuestionBlank = require('./parseBlank');
var questionOption = require('./parseOption');
var parseQuestion = require('./parseQuestion');
var parseSolution = require('./parseSolution');

var render = require('./render');



module.exports = function questionMarkdownPlugin(md) {

  md.block.ruler.before('heading', 'question', parseQuestion, {
    alt: ['paragraph']
  });

  md.block.ruler.before('blockquote', 'question_option',
    questionOption.parseTokens, {
      alt: ['paragraph']
    });

  md.block.ruler.before('blockquote', 'question_solution', parseSolution, {
    alt: ['paragraph']
  });

  md.inline.ruler.before('emphasis', 'question_blank', parseQuestionBlank);

  md.renderer.rules.section_open = render.section_open;
  md.renderer.rules.section_close = render.section_close;
  md.renderer.rules.question_open = render.question_open;
  md.renderer.rules.question_close = render.question_close;
  md.renderer.rules.subquestion_open = render.subquestion_open;
  md.renderer.rules.subquestion_close = render.subquestion_close;

  md.renderer.rules.question_no_open = render.question_no_open;
  md.renderer.rules.question_no_close = render.question_no_close;

  md.renderer.rules.question_stem_open = render.question_stem_open;
  md.renderer.rules.question_stem_close = render.question_stem_close;
  md.renderer.rules.question_blank_open = render.question_blank_open;
  md.renderer.rules.question_blank_close = render.question_blank_close;

  md.renderer.rules.question_option_open = render.question_option_open;
  md.renderer.rules.question_option_close = render.question_option_close;

  md.renderer.rules.option_item_open = render.option_item_open;
  md.renderer.rules.option_item_close = render.option_item_close;

  md.renderer.rules.option_no_open = render.option_no_open;
  md.renderer.rules.option_no_close = render.option_no_close;
};
