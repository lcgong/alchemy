
import {quoteattr} from "../util";

export function register(rules) {
  tagXpathRenderer(rules, 'question');
  tagXpathRenderer(rules, 'subquestion');

  tagXpathRenderer(rules, 'question_blank');
  tagXpathRenderer(rules, 'blank_option');
  tagXpathRenderer(rules, 'option_group');

  tagXpathRenderer(rules, 'question_notes');

  tagRendererFn(rules, 'question-stem',
    (tokens, idx, options, env, renderer) => {
      return '<div class="question-stem">';
    }, (tokens, idx, options, env, renderer) => {
      return '</div>';
    }
  );
};



export function tagRendererFn(rules, tag, openFn, closeFn) {
  rules[tag + '_open'] = openFn;
  rules[tag + '_close'] = closeFn;
};


export function tagXpathRenderer(rules, tag) {

  tagRendererFn(rules, tag,
    // openFn
    (tokens, idx, options, env, renderer) => {
      let xpathstr = quoteattr(xpathStr(tokens, idx));
      return `<${tag} xpath="${xpathstr}">`;
    },
    // closeFn
    (tokens, idx, options, env, renderer) => {
      return `</${tag}>`;
    }
  );

  // let openTag = tag + '_open';
  // let closeTag = tag + '_close';

  // // open tag function
  // rules[openTag] = function(tokens, idx, options, env, render) {
  //   let xpath = xpathStr(tokens, idx);
  //   console.log('%s:, %d, %O, xpath=%s', openTag, idx, tokens, xpath);
  //
  //   return `<${tag} xpath="${xpath}">`;
  // }
  //
  // // close tag function
  // rules[closeTag] = function(tokens, idx, options, env, render) {
  //   console.log('%s:, %d, %O', closeTag, idx, tokens);
  //
  //   return `</${tag}">`;
  // }
};


function xpathStr(tokens, idx) {

  let token = tokens[idx];
  if (!token) {
    console.log('no token to eat');
    return '';
  }

  if (!token.meta || !token.meta.xpath) {
    console.log('no xpath defined: %O', tokens);
    return '';
  }

  let xpath = token.meta.xpath;

  // console.log('render: %s, i=%d, %o', token.type, idx, xpath);

  return JSON.stringify(xpath);
}
