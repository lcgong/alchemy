import { Injectable } from '@angular/core';

import MarkdownIt from 'markdown-it';
import qmarkParser from './parser';


@Injectable()
export class QmarkService {

  private _markdown: any;

  constructor() {
    this._markdown = MarkdownIt()
    this._markdown.disable([ 'code'])
    // this._markdown.use(mathjax); // prevent markdown tag parsed in mathjax
    this._markdown.use(qmarkParser);
  }

  /* compile markdown into html */
  public compile(data:string) {
    let htmlText = this._markdown.render(data);
    return htmlText;
  }

  public getTokens(data:string) {
    return this._markdown.parse(data);
  }

}
