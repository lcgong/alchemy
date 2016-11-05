
import {parseQuestion} from './parser/question';
import {parseOption} from './parser/option';
import {parseSolution} from './parser/solution';
import {parseQuestionBlank} from './parser/blank';

import {register as registerBlankRenderer } from './renderer/blank';
import {register as registerOptionRenderer } from './renderer/option';
import {register as registerQuestionRenderer } from './renderer/question';
import {register as registerSolutionRenderer } from './renderer/solution';

export function plugin(md) {

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

  registerBlankRenderer(md.renderer.rules);
  registerOptionRenderer(md.renderer.rules);
  registerQuestionRenderer(md.renderer.rules);
  registerSolutionRenderer(md.renderer.rules);
};
