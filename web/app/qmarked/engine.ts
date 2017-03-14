
import  * as MarkdownIt  from "markdown-it";
import {plugin as qmarkPlugin} from "./qmark_plugin";
import  {plugin as mathjaxPlugin} from './mathjax_plugin';

import {unindent} from "./util";
import {analyze} from "./analyzer/analyze";

export class MarkdownEngine {

  private _markdown : any;
  private _env : any;
  private _options: any;

  tokens: any[];
  questions: any[];

  constructor() {
    this._env = {};
    this._options = {};

    let md = new MarkdownIt();
    md.disable([ 'code'])
    md.use(mathjaxPlugin); // prevent markdown tag parsed in mathjax
    md.use(qmarkPlugin);

    this._markdown = md;
  }

  parse(text: string, startQuestionNo: number) {
    text = unindent(text || '');

    this.tokens = this._markdown.parse(text, this._env);

    this.questions = analyze(this.tokens);

    let i = startQuestionNo;
    for (let q of this.questions) {
      q.displayNo = i;
      i += 1;
    }
  }

  renderHtmlText(): string {
     return this._markdown.renderer.render(this.tokens, this._options, this._env);
  }
}
