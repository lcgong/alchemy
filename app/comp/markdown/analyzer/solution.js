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
      for (let notes of subquestion.notes) {
        yield [subquestion, notes];
      }
    }

    for (let notes of question.notes) {
      yield [question, notes];
    }
  }

  for (let [question, notes] of iterSolutionNotes(question)) {
    for (let i = notes.boundBlanks.length - 1; i >=0; i--) {
      let blankSolution = notes.boundBlanks[i];

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

      blank.solution = notes.boundBlanks[i].slice(1); // 答案，['A', 'B']
      notes.boundBlanks[i] = blank;
    }
  }

  //-------------------------------------------------------------------
  // 匹配未指定题号的答案
  // 1. 就近原则，子题目的解答匹配该子题目的未命名的题空
  // 2. 子题或没有子题的主题，有答案指定的题号的不再参与匹配

  for (let [question, notes] of iterSolutionNotes(question)) {
    let isBlankBound = false;
    for (let solutionBlank of notes.boundBlanks) {
        if (!Array.isArray(solutionBlank) // 在前面已经处理过的
          || !solutionBlank[0] // 因为重号，未处理的
        ) {

          isBlankBound = true;
          break;
        }
    }

    if (isBlankBound) { //
      continue;
    }

    // 按照顺序依次匹配，直到有一个先结束
    let len = Math.min(question._boundBlanks.length, notes.boundBlanks.length);
    for (let i = 0; i < len; i++) {
      let blank = question._boundBlanks[i];

      blank.solution = notes.boundBlanks[i].slice(1); // 答案，['A', 'B']
      notes.boundBlanks[i] = blank;
    }
  }
}
