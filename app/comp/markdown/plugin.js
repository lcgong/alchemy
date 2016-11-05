
import {parseQuestionBlank} from './parseBlank';
import {parseOption} from './parseOption';
import {parseQuestion} from './parseQuestion';
import {parseSolution} from './parseSolution';
import * as render from './render';

export function questionMarkdownPlugin(md) {

  md.block.ruler.before('heading', 'question', parseQuestion, {
    alt: ['paragraph']
  });

  md.block.ruler.before('blockquote', 'question_option',
    parseOption, {
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

  md.renderer.rules.question_notes_open = render.question_notes_open;
  md.renderer.rules.question_notes_close = render.question_notes_close;

};
