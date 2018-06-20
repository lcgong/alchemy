
import MarkdownIt from 'markdown-it';

import { parseQuestion } from './question';
import { parseOption } from './option';
import { parseSolution } from './solution';
import { parseQuestionBlank } from './blank';

import { buildTagTree } from './tagtree';

function markdownItParser(md) {
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

export function createMarkdown() {
    const markdown = MarkdownIt();
    markdown.disable(['code'])
    markdown.use(markdownItParser);

    return markdown;
}

export function convertTree(markdown, text) {
    const tokens = markdown.parse(text, {});
    const tagtrees = buildTagTree(tokens);

    return tagtrees;
}

