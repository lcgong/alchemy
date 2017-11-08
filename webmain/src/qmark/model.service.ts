import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

import { MarkdownService } from './markdown.service';

@Injectable()
export class ModelService {

  private tokens: any;
  private options: {};
  private env: {};

  constructor(
    private markdownService: MarkdownService
  ) {
    console.log('qmark-model: created');
  }

  public compile(data:string):string {
    let tokens = this.markdownService.parse(data);

    let state = {
      blanks: {}
    };

    let questions = [];
    let treepath  = [0];
    this.analyze(tokens, treepath, questions, -1);
    this.normalizeBlankNo(questions);


    console.log(questions);

    return this.markdownService.render(tokens, this.options, this.env);
  }

  /** 重新规正空白序号 */
  normalizeBlankNo(questions) {
    questions.forEach( (question) => {
      let blanks = question.blanks;

      let n: number = Object.keys(blanks).length;
      if ('' in blanks) {
        n = n - 1 + blanks[''].length;
      }

      let blank_list = new Array(n);

      for (let blank_no in blanks) {
        if (blanks.hasOwnProperty(blank_no) && blank_no != '') {
          blank_list[parseInt(blank_no) - 1] = blanks[blank_no];
        }
      }
      
      if ('' in blanks) {
        let unmarked = blanks[''];
        for(let k = 0; k < n; k++) {
          if (typeof blank_list[k] === 'undefined') {
            let token = unmarked.shift();
            token.attrSet('no', (k + 1).toString());
            blank_list[k] = [token];
          }
        }
      }

      question.blanks = blank_list;
    });
  }

  public analyze(tokens, treepath, questions, question_num) {
    for (let i=0; i < tokens.length; i++) {
      treepath[0] += 1;
      
      let token = tokens[i];
      if (token.type == 'question_open') {
        question_num += 1;
        questions.push({
          blanks: {}
        });

        continue;
      }

      if (token.children) {
        this.analyze(token.children, [0].concat(treepath), questions, question_num);
      }

      let tpath_expr = [].concat(treepath).reverse().join(',');

      if (token.type == 'question_open') {
        token.attrSet('tpath', tpath_expr);
      
      } else if (token.type == 'subquestion_open') {
        token.attrSet('tpath', tpath_expr);
  
      } else if (token.type == 'question_blank_open') {
        token.attrSet('tpath', tpath_expr);

        let no = token.attrGet('no').trim();
        let blanks = questions[question_num].blanks
        if (no in blanks) {
          blanks[no].push(token);
        } else {
          blanks[no] = [token];
        }

      } else if (token.type == 'option_group_open') {
        token.attrSet('tpath', tpath_expr);
        
      } else if (token.type == 'question_option_open') {
        token.attrSet('tpath', tpath_expr);

      } else if (token.type == 'solution_open') {
        token.attrSet('tpath', tpath_expr);

      }
    }
  }
  
//  // Observable string sources
//  private missionAnnouncedSource = new Subject<string>();
//  private missionConfirmedSource = new Subject<string>();

//  // Observable string streams
//  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
//  missionConfirmed$ = this.missionConfirmedSource.asObservable();

//  // Service message commands
//  announceMission(mission: string) {
//    this.missionAnnouncedSource.next(mission);
//  }

//  confirmMission(astronaut: string) {
//    this.missionConfirmedSource.next(astronaut);
//  }
}
