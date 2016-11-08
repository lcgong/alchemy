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
