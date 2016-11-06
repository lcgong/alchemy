
class Blank {
  constructor(blank_no) {
    this._blank_no = blank_no;
    this._answer = null;
    this.solution = null;
  }

  get blankNo() {
      return this._blank_no;
  }

  get answer() {
      return this._answer;
  }

  set answer(str) {
    this._answer = str;
  }
}

class Option {
  constructor(optionNo) {
    this._optionNo = optionNo;
    this._origOptionNo = optionNo;
  }

  get optionNo() {
      return this._optionNo;
  }

  get origOptionNo() {
      return this._origOptionNo;
  }
}

export class OptionGroup {
  //
  constructor() {
    this._permutation = null;
    this._translate = null;
    this._options = {};
  }

  get options() {
    return this._options;
  }

  makeOption(optionNo) {
    let option = new Option(optionNo);
    this._options[optionNo] = option;
    return option;
  }

  /** 按选项号顺序显示
    */
  *ascending() {
    for (option_no of Object.keys(this._options).sort()) {
      yield this._options[option_no];
    }
  }


  get permutation() {
      return this._permutation;
  }

  /** 设置置换序，比如总共4个选项，一个置换数如3120等
   * 置换相对的是原始顺序。
   */
  set permutation(permutation) {

    if (permutation === null) {
      // 设置null，恢复原始顺序
      this._permutation = null;
      this._translation = null; // 翻译字典，变换成按原始顺序编制的选项号
      let options = {};

      for (let option of Object.values(this._options)) {
        option.op = this._options[origOptNolist[permutation[i]]];
        option.optionNo = option.origOptionNo;
        options[option.optionNo] = option;
      }
      this._options = options;
    }

    if (!Array.isArray(permutation)) {
      throw "permutation is not a object of array";
    }

    let origOptNolist = Object.values(this._options).map(x => x.origOptionNo);
    if (origOptionNo.length != permutation.length) {
      throw "the length of permutation is not equal to that of options";
    }

    let options = {};
    this._translation = {};
    for (let i = 0; i < permutation.length; i++) {
      let newOptionNo = origOptNolist[i];
      let oldOptionNo = origOptNolist[permutation[i]];

      let option = this._options[oldOptionNo];
      option.optionNo = newOptionNo;
      options[newOptionNo] = option;

      this._translation[newOptionNo] = oldOptionNo;
    }

    this._permutation = permutation;
    this._options = options;
  }

  /** 用于将置换后的编号翻译成原来顺序的编号
   */
  translateToOriginalNo(permutatedOptionNoList) {
    if (this._permutation === null) {
      return permutatedOptionNoList;
    }

    return permutatedOptionNoList.map(x => this._translation[x]);
  }
};


export class Solution {
  constructor(result) {
    this.blank = null;
    this.result = result;
  }

};

export class Notes {
  constructor(question) {
    this._question = question;
    this.solutions = [];
  }

  makeSolution(solution) {
    let obj = new Solution(solution);
    this.solutions.push(obj);
    return obj;
  }
};

/**
 * 每题的题空和选项是一组，选项顺序和题空的答案的变化顺序是一致的
 */
class BaseQuestion {
  constructor() {
    this._boundBlanks = [];
    this._optionGroup = null;

    this.notes = [];
    this.errors = [];
  }

  makeOptionGroup() {
    this._optionGroup = new OptionGroup();
    return this._optionGroup;
  }

  makeNotes() {
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

  constructor() {
    super();
    this._blanks = {};
    this._subquestions = [];
    this.displayNo = 1;
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
  bindBlank(blank_no) {

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
  _makeBlank(blank_no) {

    if (blank_no === undefined || blank_no === null || blank_no === '' ) {
      // 若题空的序号为空则使用题空出现的顺序
      blank_no = (Object.keys(this._blanks).length + 1).toString();
    }

    if (blank_no in this._blanks) {
      return this._blanks[blank_no];
    } else {
      let blank = new Blank(blank_no);
      this._blanks[blank_no] = blank;

      blank.xpath = [blank_no].concat(this.xpath);

      return blank;
    }
  }
};

export class Subquestion extends BaseQuestion {

  constructor(question) {
    super();
    this._question = question;
  }

  /**
    */
  bindBlank(blank_no) {

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


/** Fisher–Yates shuffle
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
function shuffle(array) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);

        counter--;

        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
