import {TokenSection, findTokenSections} from "./token";

// 从markdown解析格式，[0, 'A', 'B']，第一个表示指定的题号
// 将上述形式，转换为 ['A', 'B']

export function analyzeNotes(question, section) {
  for(let notesSection of findTokenSections('question_notes', section)) {
    let notes = question.makeNotes();

    let solutionList = notesSection.get(notesSection.bgnIndex).meta.solution;
    for (sol of solutionList) {
      // [0, 'A', 'B'] 第一个数为题空号，后面是答案，临时格式，需要后面整理
      notes.boundBlanks.push(sol);
    }
  }
}

export function reformSolutions(question) {

  // 识别有问号的
  let namedSolutions = [];
  let unnamedSolutions = [];

  let blanks = question._blanks;

  // ---------------------------------------------------------------
  // 先匹配指定了题号的答案

  function* iterSolutionNotes(question){
    for (let subquestion of question.subquestions) {
      // 将子问题的多个notes的答案boundBlanks按顺序合并
      let boundBlanks = [];
      for (let notes of subquestion.notes) {
        boundBlanks = boundBlanks.concat(notes.boundBlanks);
      }

      yield [subquestion, boundBlanks];
    }

    let boundBlanks = [];
    for (let notes of question.notes) {
      boundBlanks = boundBlanks.concat(notes.boundBlanks);
    }
    yield [question, boundBlanks];
  }

  for (let [question, boundBlanks] of iterSolutionNotes(question)) {
    for (let i = boundBlanks.length - 1; i >=0; i--) {
      let blankSolution = boundBlanks[i];

      let blankNo = blankSolution[0];  // [null, 'A', 'B'] or [0, 'A', 'B']
      if (!blankNo) { // 跳过没有指定题空号的
        continue;
      }

      let blank = blanks[blankNo];
      if (!blank) {
        let errmsg = `第$(sol[0])问答案没有对应的“空白”`;
        question.errors.push(errmsg);
        console.error(errmsg);
        continue;
      }

      if (blank.solution && blank.solution.length > 0) {
        // 如果两个答案都指定同一个答案
        // 以Blank第一次出现的答案为准，跳过已经有答案的blank
        continue;
      }

      blank.solution = boundBlanks[i].slice(1); // 答案，['A', 'B']
      boundBlanks[i] = blank;
    }
  }

  //-------------------------------------------------------------------
  // 匹配未指定题号的答案
  // 1. 就近原则，子题目的解答匹配该子题目的未命名的题空
  // 2. 子题或没有子题的主题，有答案指定的题号的不再参与匹配

  function isAlreadyBound(boundBlanks) {
    for (let solutionBlank of boundBlanks) {
      if (!Array.isArray(solutionBlank) || solutionBlank[0]) {
        // 1. 已经不是数组了，前面已经处理过
        // 2. 因为答案指定了相同号，而未处理的，忽略
        return true;
      }
    }
    return false;
  }

  for (let [question, boundBlanks] of iterSolutionNotes(question)) {
    console.log(1111, question, boundBlanks);

    if (isAlreadyBound(boundBlanks)) {
      continue;
    }

    // 按照顺序依次匹配，直到有一个先结束
    let len = Math.min(question._boundBlanks.length, boundBlanks.length);

    for (let i = 0; i < len; i++) {
      let blank = question._boundBlanks[i];

      blank.solution = boundBlanks[i].slice(1); // 答案，['A', 'B']
      boundBlanks[i] = blank;
    }
  }

  // 3. 主题上的题空，对应于子题中的选项的解答，如果遇到子题的已经指定解答，中止查找

  // let blankNoList = Object.keys(question._blanks).sort();
  let idx = 0;
  for (let [subquestion, boundBlanks] of iterSolutionNotes(question)) {
    if (isAlreadyBound(boundBlanks)) {
      break;
    }

    let stop = false;
    for (let i = 0; i < boundBlanks.length; i++) {
        if (idx >= question._boundBlanks.length) {
          stop = true;
          break;
        }

        let blank = question._boundBlanks[idx];

        console.log(i, idx, blank, question)

        blank.solution = boundBlanks[i].slice(1); // 答案，['A', 'B']
        boundBlanks[i] = blank;

        idx += 1;
    }

    if (stop) {
      break;
    }
  }

  console.log(question);
}
