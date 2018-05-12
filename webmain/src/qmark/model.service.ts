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

    let metainfos = [];
    walkQuestion(tokens, metainfos, 0, tokens.length);
    console.log(3333, metainfos)

    // let questions = [];
    // let treepath  = [0];
    // analyze(tokens, treepath, questions, -1);
    // this.normalizeBlankNo(questions);


    // console.log(questions);

    return this.markdownService.render(tokens, this.options, this.env);
  }

  /** 重新规正空白序号 */
  public normalizeBlankNo(questions) {
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
}


// metainfos: [ metainfo1， metainfo2 ]
// metainfo: { 
//   blanks: [ blank_1, blank_2, ... ],
//   solutions: [ blank_1_sol, blank_2_sol, ... ],
//   optiongroup: [ optgrp_main, optgrp_subquest1, optgrp_subquest2, ... ] 
// }

class TokenSlice {
  constructor(public tag, public start, public end) {
  }
}

function normalizeBlankInfoList(blanks) {
  // 先按照指定题空号字符串分别归类 {'1': [ tokenSlice1, ], '':[] }, ''表示没有指定号
  // 转换为按照题号顺序排列的 [ [blank1_tokenSlice1,..], [blank2_tokenSlice1,..] ]
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

  return blank_list;
}


function walkQuestion(tokens, metainfos, start, endpos) {
  let questInfo;
  let optionGroups;

  let newStemBlanks = false;

  for (let pos = start; pos < endpos; pos++) {
    let token = tokens[pos];

    if (token.type == 'question_open') {
      newStemBlanks = true;
      questInfo = {
        slice: [pos, null],
        blanks: {},
        optionGroups: [null]
      };

      optionGroups = questInfo.optionGroups;

      continue;
    }

    if (token.type == 'question_close') {
      questInfo.slice[1] = pos + 1;
      questInfo.blanks = normalizeBlankInfoList(questInfo.blanks);
      
      console.log('7777 %O', questInfo.blanks);
      
      metainfos.push(questInfo);

      continue;
    }

    // optionGroups[0] 留给主问题，即使没有也填写null留出，其它子问题从1开始
    if (token.type == 'option_group_open') {
      if (newStemBlanks) {
        newStemBlanks = false;
        let boundBlanks = [];
        searchBlanks(tokens, boundBlanks, questInfo.slice[0], pos);
        console.log('stem blanks: ', boundBlanks);
      }

      pos = searchOptionGroup(tokens, 0, optionGroups, pos, endpos)

      
      continue;
    }
    
    if (token.type == 'subquestion_open') {
      if (newStemBlanks) {
        newStemBlanks = false;

        let boundBlanks = [];
        searchBlanks(tokens, boundBlanks, questInfo.slice[0], pos);
        console.log('stem blanks: ', boundBlanks);
      }
      pos = searchSubquestion(tokens, questInfo, pos, endpos)
      continue;
    }
  }
}


function searchBlanks(tokens, blankTokens, start, endpos) {
  for (let pos = start; pos < endpos; pos++) {
    let token = tokens[pos];
    let token_type = token.type;

    if (token_type == 'question_blank_open') {
      blankTokens.push(token);
      continue;
    }

    if (token_type == 'question_blank_close') {
      continue;
    }

    if (token.children && token.children.length > 0) {
      searchBlanks(token.children, blankTokens, 0, token.children.length);
    }
  }
}

function searchSubquestion(tokens, questInfo, start, endpos) {

  let optGroups = questInfo.optionGroups;

  for (let pos = start + 1; pos < endpos; pos++) {
    let token = tokens[pos];

    if (token.type == 'option_group_open') {
      pos = searchOptionGroup(tokens, -1, optGroups, pos, endpos)
      continue;
    }

    if (token.type == 'subquestion_close') {
      return pos;
    }

  }
}

function searchOptionGroup(tokens, optGrpIdx, optionGroups, start, endpos) {
  let pos = start + 1; // to skip 'option_group_open' token

  let optionList = [];
  let optionStartPos;

  for (; pos < endpos; pos++) {
    let token = tokens[pos];
    let type  = token.type;

    if (type == 'question_option_open') {
      
      optionStartPos = pos;
      continue;
    }

    if (type == 'question_option_close') {

      let slice = new TokenSlice('question_option', optionStartPos, pos + 1);
      optionList.push(slice);
      continue;
    }

    if (type == 'option_group_close') {
      if (optGrpIdx == -1) {
        optionGroups.push(optionList);
      } else {
        optionGroups[0] = optionList;
      }
      
      return pos;
    }
  }
}

function analyze(tokens, treepath, questions, question_num) {
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
      analyze(token.children, [0].concat(treepath), questions, question_num);
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
