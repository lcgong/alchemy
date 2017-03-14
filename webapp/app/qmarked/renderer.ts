
import {quoteattr} from "./util";

export function register(rules: any) {
  tagXpathRenderer(rules, 'question');
  tagXpathRenderer(rules, 'subquestion');

  tagXpathRenderer(rules, 'question_blank');
  tagXpathRenderer(rules, 'blank_option');
  tagXpathRenderer(rules, 'option_group');

  tagXpathRenderer(rules, 'question_notes');

  tagRendererFn(rules, 'question-stem',
    (tokens:any, idx: number, options: any, env: any, renderer:any) => {
      return '<div class="question-stem">';
    }, (tokens:any, idx: number, options: any, env: any, renderer:any) => {
      return '</div>';
    }
  );
};



export function tagRendererFn(rules:any, tag:any, openFn:any, closeFn:any) {
  rules[tag + '_open'] = openFn;
  rules[tag + '_close'] = closeFn;
};


export function tagXpathRenderer(rules:any, tag:any) {

  tagRendererFn(rules, tag,
    // openFn
    (tokens:any, idx: number, options: any, env: any, renderer:any) => {
      let xpathstr = quoteattr(xpathStr(tokens, idx));
      return `<${tag} xpath="${xpathstr}">`;
    },
    // closeFn
    (tokens:any, idx: number, options: any, env: any, renderer:any) => {
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


function xpathStr(tokens: any, idx: any) {

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
