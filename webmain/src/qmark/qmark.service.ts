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


  // comple markdown to html
  public compile(data:string) {
    // let env = {};
    // let options = {};
    // let tokens = md.parse(text, env);
    // let questions = analyze(tokens);

    let htmlText : string;

    let env: any = {};

    let tree: any = this._markdown.parse(data, env);
    console.log(tree);

    htmlText = this._markdown.render(data)

    return htmlText;
    // return '<i>abc</i>';
    // return marked(data);
  }

}
