
import {parseQuestion} from './parser/question';
import {parseOption} from './parser/option';
import {parseSolution} from './parser/solution';
import {parseQuestionBlank} from './parser/blank';

import {register as rendererRegister } from './renderer';

export function plugin(md: any) {

  md.block.ruler.before('heading', 'question', parseQuestion, {
    alt: ['paragraph']
  });

  md.block.ruler.before('blockquote', 'option_group',
    parseOption, {
      alt: ['paragraph']
    });

  md.block.ruler.before('blockquote', 'question_solution', parseSolution, {
    alt: ['paragraph']
  });

  md.inline.ruler.before('emphasis', 'question_blank', parseQuestionBlank);

  rendererRegister(md.renderer.rules);
};
