import {TokenSection, findTokenSections} from "./token";


export function analyzeNotes(question, section) {
  for(let notesSection of findTokenSections('question_notes', section)) {
    let notes = question.makeNotes();

    let solutionList = notesSection.get(notesSection.bgnIndex).meta.solution;
    for (sol of solutionList) {
      notes.makeSolution(sol);
    }
  }
}

export function reformSolutions(question) {

  // 识别有问号的
  let namedSolutions = [];
  let unnamedSolutions = [];

  let blanks = question._blanks;

  function setBlankOfSolution(solution, blank_no) {
    if (!blanks[blank_no]) {
      subquestion.errors.push(`第$(sol[0])问答案没有对应的“空白”`);
    } else {
      let blank =  blanks[blank_no];
      if (!blank.solution) { // 以Blank第一次出现的答案为准
        blank.solution = solution;
      }
      solution.blank = blank;
      solution.result = solution.result.slice(1);
    }
  }

  // ---------------------------------------------------------------
  // 先答案指定的题号匹配
  for (subquestion of question.subquestions) {
    for (notes of subquestion.notes) {
      for (solution of notes.solutions) {

        let blank_no = solution.result[0];
        if (blank_no) { // 指定了题号
          setBlankOfSolution(solution, blank_no)
        }
      }
    }
  }

  for (notes of question.notes) {
    for (solution of notes.solutions) {

      let blank_no = solution.result[0];
      if (blank_no) { // 指定了题号
        setBlankOfSolution(solution, blank_no)
      }
    }
  }

  //-------------------------------------------------------------------
  // 匹配未指定题号的答案所对应的题空

  // 匹配在子问题中出现了的题号，但其该子问题所属的答案没有指定题号的

  function findAllUnamed(question) {
    let unresolvedSolutions = [];

    for (notes of question.notes) {
      for (solution of notes.solutions) {
        // 未指定的题号的答案 [null, ... ]

        if (solution.blank) { // 一旦指定了题号，即使后面未指定题号的不再考虑
          break;
        }

        unresolvedSolutions.push(solution);
      }
    }
    return unresolvedSolutions;
  }

  function matchUnanmeSolution(boundBlanks, solutions) {

    // 未指定答案的题空
    boundBlanks = boundBlanks.filter(blank => !blank.solution);

    let len = Math.min(boundBlanks.length, solutions.length);

    let boundedSolutions = solutions.splice(0, len);
    for (let i = boundedSolutions.length - 1; i >= 0; i--) {
      let solution = boundedSolutions[i];

      let blank =  boundBlanks[i];
      if (!blank.solution) { // 以Blank第一次出现的答案为准
        blank.solution = solution;
      }

      solution.blank = blank;
      solution.result = solution.result.slice(1); // [null, A, ..] => [A, ..]
    }

    return solutions; // unresolved results left
  }

  for (subquestion of question.subquestions) {
    let unresolvedSolutions = findAllUnamed(subquestion);

    matchUnanmeSolution(subquestion._boundBlanks, unresolvedSolutions);
  }

  let unresolvedSolutions = [];
  for (subquestion of question.subquestions) {
    unresolvedSolutions = unresolvedSolutions.concat(findAllUnamed(subquestion));
  }

  matchUnanmeSolution(question._boundBlanks, unresolvedSolutions);
}
