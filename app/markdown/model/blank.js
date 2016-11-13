
export class Blank {
  constructor(question, blank_no) {
    this._question = question;

    this._blank_no = blank_no;

    this.resolved = [];  // 测试中所回答的答案
    this.solution = null; // 标准答案

    this.targetable = false; // 参见option-group directive里的使用方法
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

    for (let subquestion of this._question.subquestions) {
      for (let blank of subquestion.optionGroup.targetableCandidates) {
        if (blank === this) {
          return subquestion.optionGroup;
        }
      }
    }

    if (!this._question.optionGroup) {
      return;
    }

    for (let blank of this._question.optionGroup.targetableCandidates) {
      if (blank === this) {
        return this._question.optionGroup;
      }
    }

    return null;
  }

  setTarget() {
    if (this.targetingOptionGroup) {
      return;
    }

    // 假定blank是没有被列为目标的
    let optionGroup = this.getTargetingOptionGroup();
    if (!optionGroup) {
      console.log('题空%d没有选项', blank.blankNo);
      return;
    }

    if (optionGroup.targetedBlank) { //如果选项组已经有目标，要想将其解除
      optionGroup.targetedBlank.targetingOptionGroup = null;
    }

    // 坑！ 当angularjs的watch机制应用对象时，不要形成环形引用，
    // 否则引发Maximum call stack size exceeded
    //
    // optionGroup.targetedBlank = this;
    this.targetingOptionGroup = optionGroup;

    console.log('Blank(%d) set a target to option group %o',
      this.blankNo, optionGroup.xpath);
  }

  unsetTarget() {
    let targetingOptionGroup = this.targetingOptionGroup;
    if (!targetingOptionGroup) {
      console.log('Blank(%d): there is no target to unset', this.blankNo);
      return;
    }

    targetingOptionGroup.targetedBlank = null;
    this.targetingOptionGroup = null;

    console.log('Blank(%d) unset target to option group %o',
                this.blankNo, targetingOptionGroup.xpath);
  }
};

/** 给question的每个OptionGroup找打其对应的blank，一个group会可能对应多个blank */
export function collectTargingBlankCandidates(question) {

  let candidates = [];
  for (blank_no in question._blanks) {
    candidates.push(question._blanks[blank_no]);
  }
  candidates.sort(function (a, b) {
    if (a.blank_no > b.blank_no) {
      return 1;
    }
    if (a.blank_no < b.blank_no) {
      return -1;
    }
    return 0;
  });

  // 1. 如果在子题目中出现的blank优先作为该问题所对应的optionGroup的候选
  for (subquestion of question.subquestions) {
    for (blank of subquestion._boundBlanks) {
      subquestion.optionGroup.targetableCandidates.push(blank);
      candidates.splice(candidates.indexOf(blank), 1);
    }
  }


  // 2. 如果主题题干中出现的blank作为该问题所对应的optionGroup的候选
  for (blank of question._boundBlanks) {
    if (question.optionGroup) { // 主题可能没有选项组
      question.optionGroup.targetableCandidates.push(blank);
      candidates.splice(candidates.indexOf(blank), 1);
    }
  }

  // 3. 对于剩下的候选题目，
  // 如果子题没有指定候选，则按照子题出现的顺序和题空白号依次匹配
  let candidateIdx = 0;
  for (subquestion of question.subquestions) {
    if (subquestion._boundBlanks.length == 0) { // 没有出现题空
      if (subquestion.optionGroup) {
        let blank = candidates[candidateIdx];
        subquestion.optionGroup.targetableCandidates.push(blank);
        candidateIdx += 1;
      }
    }
  }
  candidates.splice(0, candidateIdx);

  if (candidates.length > 0) {
    let nolst = candidates.map((blank) => {return '' + blank.blank_no}).join(', ');
    question.errors.push(`题目空白${nolst}没有选项对应`);
  }
}
