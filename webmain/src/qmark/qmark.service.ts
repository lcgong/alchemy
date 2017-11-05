import { Injectable } from '@angular/core';
import { Http, Response} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as  MarkdownIt from 'markdown-it';


import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class QmarkService {
  // private _renderer: any = new marked.Renderer();

  private _markdown: any;

  constructor(private http: Http) {
    this._markdown = MarkdownIt()
    // this.setMarkedOptions({});
  }

  // public get renderer() {
  //   return this._renderer;
  // }

  // handle data
  public extractData(res: Response): string {
    return res.text() || '';
  }


  public setMarkedOptions(options: any) {
    options = Object.assign({
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    }, options);
    // options.renderer = this._renderer;
    // marked.setOptions(options);
  }

  // comple markdown to html
  public compile(data:string) {
    return this._markdown.render(data);
    // return '<i>abc</i>';
    // return marked(data);
  }

}
