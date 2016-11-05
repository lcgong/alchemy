import {Question} from "../question";

class TokenSection {
  constructor(tokens, bgnIndex, endIndex) {
    this.tokens = tokens;
    this.bgnIndex = bgnIndex;
    this.endIndex = endIndex;
  }

  get(index) {
    return this.tokens[index];
  }

  new(bgnIndex, endIndex) {
    return new TokenSection(this.tokens, bgnIndex, endIndex);
  }
}

export function analyze(tokens) {

  let questions = [];

  let section = new TokenSection(tokens, 0, tokens.length - 1);

  for(let questionSection of findTokenSections('question', section)) {
    let question = new Question();
    question.tokens = questionSection;
    questions.push(question);

    analyzeQuestion(question, questionSection);
  }

  return questions;
}

function analyzeQuestion(question, section) {

  let bgnIdx;

  let subquestionSections = [...findTokenSections('subquestion', section)];
  for(subquestionSection of subquestionSections) {
    analyzeSubquestion(question, subquestionSection);
  }

  if (subquestionSections.length > 0) {

    // 截取subquestion后的部分
    let prevSection = subquestionSections[subquestionSections.length - 1];
    section = section.new(prevSection.endIndex + 1, section.endIndex);
  }

  analyzeNotes(question, section) // 解析题目的解答说明

  // -------------------------------------------------------------------------
  // 解析一开头的题目正文部分，所有出现的"题空"

  let topicEndIdx; // 判断题目正文结束的位置
  if (subquestionSections.length > 0) {
    topicEndIdx = subquestionSections[0].bgnIndex - 1;
  } else if (notesSections.length > 0) {
    topicEndIdx = notesSections[0].bgnIndex - 1;
  } else {
    topicEndIdx = section.endIndex;
  }

  analyzeAllBlank(question, question.tokens.bgnIndex, topicEndIdx);

  reformSolutions(question);
}

function analyzeSubquestion(question, section) {

  let subquestion = question.makeSubquestion();
  subquestion.tokens = section;

  let optgrpSection = analyzeOptionGroup(subquestion, section);

  analyzeAllBlank(subquestion, section.bgnIndex, optgrpSection.bgnIndex - 1);

  analyzeNotes(subquestion, section)
}

/** 解析question和subquestion问中的题空
 */
function analyzeAllBlank(question, bgnIdx, endIdx) {

  let section = question.tokens.new(bgnIdx, endIdx);

  for(let blankSection of findTokenSections('question_blank', section, true)) {

    let token = blankSection.get(blankSection.bgnIndex);

    let blank = question.bindBlank(token.meta.questionNo);
    blank.tokens = blankSection;
  }
}

function analyzeOptionGroup(question, section) {

  // 因为解析问题，可能存在多个OptionGroup，需要将多个合并
  let groupSections = [...findTokenSections('question_option', section)];
  if (groupSections.length > 0) {
    let optionGroup = question.makeOptionGroup()

    optionGroup.tokens = section.new(groupSections[0].bgnIndex,
                            groupSections[groupSections.length-1].endIndex);

    for(groupSection of groupSections) {
      for(let optionSection of findTokenSections('option_item', groupSection)) {
         analyzeOption(optionGroup, optionSection);
      }
    }
  }

  if (groupSections.length == 0) {
    return;
  }

  let theLast = groupSections[groupSections.length - 1];

  return theLast.new(groupSections[0].bgnIndex, theLast.endIndex);
}

function analyzeOption(optionGroup, optionSection) {

  let token;
  token = findTokenSections('option_no', optionSection).next().value;

  token = optionSection.get(token.bgnIndex);
  let optionNo = token.meta.optionNo;

  let option = optionGroup.makeOption(optionNo);
  option.tokens = optionSection;

  return optionSection;
}

function analyzeNotes(question, section) {
  for(let notesSection of findTokenSections('question_notes', section)) {
    let notes = question.makeNotes();

    let solutionList = notesSection.get(notesSection.bgnIndex).meta.solution;
    for (sol of solutionList) {
      notes.makeSolution(sol);
    }
  }
}

function reformSolutions(question) {

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

/** 遍历tokens找出name的<name>_open和<name>_open的范围*/
function* findTokenSections(name, tokenSection, recursive) {

  let openTagName = name + '_open';
  let closeTagName = name + '_close';

  let lastBgnIdx, lastEndIdx;

  let bgnIndex = tokenSection.bgnIndex;
  let endIndex = tokenSection.endIndex;

  for (let idx = bgnIndex; idx <= endIndex; idx++) {

    let token = tokenSection.get(idx);

    if (recursive && token.children) {
      let tokens = token.children;
      let section = new TokenSection(tokens, 0, tokens.length - 1);

      for (section of findTokenSections(name, section, recursive)) {
        yield section;
      }
    }

    if (token.type == openTagName) {
      lastBgnIdx = idx;

    } else if (token.type == closeTagName) {
      lastEndIdx = idx;

      yield tokenSection.new(lastBgnIdx, lastEndIdx);
    }
  }
}
