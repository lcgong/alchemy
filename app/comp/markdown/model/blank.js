
export class Blank {
  constructor(question, blank_no) {
    this._question = question;

    this._blank_no = blank_no;
    this._answer = null;
    this.solution = null;

    this.targetingOptionGroup = null;
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

  /** 得到blank所对应的选项组所在题目 */
  getTargetingOptionGroup() {
    if (this.targetingOptionGroup) {
      return this.targetingOptionGroup;
    }

    for (subquestion of this._question.subquestions) {
      if (subquestion._boundBlanks.includes(this)) {
        return subquestion.optionGroup;
      }
    }
    if (!this._question._boundBlanks) {
      return;
    }
    if (this._question._boundBlanks.includes(this)) {
      return this._question.optionGroup;
    }
  }
}

export function setTarget(blank, optionGroup) {
  unsetTarget(blank, optionGroup);

  optionGroup.targetedBlank = blank;
  blank.targetingOptionGroup = optionGroup;

  console.log(1333323, blank);

}

export function unsetTarget(blank, optionGroup) {
  if (blank.targetingOptionGroup) {
    blank.targetingOptionGroup.targetedBlank = null;
  }

  blank.targetingOptionGroup = null;

  if (optionGroup) {
    if (optionGroup.targetedBlank) {
      optionGroup.targetedBlank.targetingOptionGroup = null;
    }
    optionGroup.targetedBlank = null;
  }
}
