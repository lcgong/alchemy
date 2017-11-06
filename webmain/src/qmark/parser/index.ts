import {parseQuestion} from './question';
import {parseOption} from './option';
import {parseSolution} from './solution';
import {parseQuestionBlank} from './blank';


export default function plugin(md: any) {
  md.inline.ruler.before('emphasis', 'question_blank', parseQuestionBlank);

  md.block.ruler.before('heading', 'question', parseQuestion, {
    alt: ['paragraph']
  });

  md.block.ruler.before('blockquote', 'option_group', parseOption, {
    alt: ['paragraph']
  });

  md.block.ruler.before('blockquote', 'question_solution', parseSolution, {
    alt: ['paragraph']
  });
}
