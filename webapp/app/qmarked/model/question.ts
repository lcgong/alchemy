
import {Blank} from "./blank";
import {Option, OptionGroup} from "./option"
import {Notes} from "./solution"


/**
 * 每题的题空和选项是一组，选项顺序和题空的答案的变化顺序是一致的
 */
class BaseQuestion {
  public _boundBlanks : Blank[];
  public _optionGroup : any;
  public notes : any;
  public errors : any;

  constructor() {
    this._boundBlanks = [];
    this._optionGroup = null;

    this.notes = [];
    this.errors = [];
  }

  makeOptionGroup() {
    this._optionGroup = new OptionGroup(this);
    return this._optionGroup;
  }

  makeNotes() : Notes {
    let notes = new Notes(this);
    this.notes.push(notes);
    return notes;
  }

  get optionGroup() {
      return this._optionGroup;
  }

  get boundBlanks() {
      return this._boundBlanks;
  }
}


export class Question extends BaseQuestion {

  constructor(public _blanks: any,
              public _subquestions: any,
              public displayNo: number,
              public xpath: any[]) {
    super();

    this._blanks = {};
    this._subquestions = [];
    this.displayNo = 1;
  }

  get blanks() {
    return this._blanks;
  }

  makeSubquestion() {
    let subquestion = new Subquestion(this);
    this._subquestions.push(subquestion);

    return subquestion;
  }

  get subquestions() {
    return this._subquestions;
  }

  /**
    */
  bindBlank(blank_no: string) {

    let blank = this._makeBlank(blank_no);

    for (let obj of this._boundBlanks) {
      if (obj == blank) {
        return blank; // 如果已经绑定过，无需重复绑定
      }
    }

    this._boundBlanks.push(blank);

    return blank;
  }

  /**
   * 按“题空”的编号产生“题空”对象，若给定的题号有题空则用原有的
   */
  _makeBlank(blank_no: string) {

    if (blank_no === undefined || blank_no === null || blank_no === '' ) {
      // 若题空的序号为空则使用题空出现的顺序
      blank_no = (Object.keys(this._blanks).length + 1).toString();
    }

    if (blank_no in this._blanks) {
      return this._blanks[blank_no];
    } else {
      let blank = new Blank(this, blank_no);
      this._blanks[blank_no] = blank;

      blank.xpath = [blank_no].concat(this.xpath);

      return blank;
    }
  }
};

export class Subquestion extends BaseQuestion {

  constructor(public _question: Question) {
    super();
  }

  /**
    */
  bindBlank(blank_no: string) {

    let blank = this._question._makeBlank(blank_no);

    for (let obj of this._boundBlanks) {
      if (obj == blank) {
        return blank; // 如果已经绑定过，无需重复绑定
      }
    }

    this._boundBlanks.push(blank);

    return blank;
  }

};

export function makeQuestionSolutionSignature(question: Question) {
  if (!question)
    return;

  let optgroups = {};

  let optgrpSig = [];
  let blankSig = [];

  let optgrpNum = 0; //
  let optgrp;

  for (let subquest of question.subquestions) {
    optgrp = subquest.optionGroup;
    optgrpSig.push(Object.keys(optgrp._options).length)
    optgroups[optgrp] = optgrpNum;
    optgrpNum++;
  }

  optgrp = question.optionGroup;
  if (optgrp) {
    optgrpSig.push(Object.keys(optgrp._options).length)
    optgroups[optgrp] = optgrpNum;
    optgrpNum++;
  }

  for (let blank_no of Object.keys(question._blanks).sort()) {
    let blank = question._blanks[blank_no]

    let optgrp = blank.getTargetingOptionGroup();

    let targeting = -1;
    if (typeof optgroups[optgrp] !== 'undefined') {
      targeting = optgroups[optgrp];
    }

    blankSig.push([targeting, blank.solution])
  }

  let signature = [blankSig, optgrpSig]

  console.log(question, signature);

  return signature;
}
