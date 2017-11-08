import { Injectable } from '@angular/core';

import MarkdownIt from 'markdown-it';
import qmarkParser from './parser';


@Injectable()
export class MarkdownService {

  private _markdown: any;

  constructor() {
    this._markdown = MarkdownIt()
    this._markdown.disable([ 'code'])
    // this._markdown.use(mathjax); // prevent markdown tag parsed in mathjax
    this._markdown.use(qmarkParser);

    console.log('markdownit: created');
  }

  /** compile markdown into html */
  public parse(data:string) {

    return this._markdown.parse(data);
  }

  /** render markdown tokens */
  public render(tokens: any, opts:{string:any}|{}, env:{string:any}|{}) {

    opts = opts || {};
    env  = env  || {};
    return this._markdown.renderer.render(tokens, opts, env);
  }
}
