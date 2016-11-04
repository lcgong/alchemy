

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

  let notesSections = [...findTokenSections('question_notes', section)];
  for(let notesSection of notesSections) {
    analyzeQuestionNotes(question, notesSection);
  }

  // -------------------------------------------------------------------------
  // 解析一开头的题目正文部分，所有出现的"题空"

  let topicEndIdx; // 判断题目正文结束的位置
  if (subquestionSections.length > 0) {
    topicEndIdx = subquestionSections[0].bgnIdx - 1;
  } else if (notesSections.length > 0) {
    topicEndIdx = notesSections[0].bgnIdx - 1;
  } else {
    topicEndIdx = section.endIndex;
  }

  section = section.new(question.tokens.bgnIdx, topicEndIdx);
  for(let blankSection of findTokenSections('question_blank', section)) {
    analyzeBlank(question, blankSection);
  }
}


function analyzeSubquestion(question, section) {

  let grpSection = analyzeOptionGroup(question, section);

  let topicSection = groupSection.new(section.bgnIndex, grpSection.bgnIndex - 1)

  for(let blankSection of findTokenSections('question_blank', topicSection)) {
    analyzeBlank(question, blankSection);
  }

  let notesSections = [...findTokenSections('question_notes', section)];
  for(let notesSection of notesSections) {
    analyzeQuestionNotes(question, notesSection);
  }
}

/** 解析question和subquestion问中的题空
 */
function analyzeBlank(question, blankSection) {

  let token = blankSection.get(blankSection.bgnIndex);

  let blank = question.bindBlank(token.meta.questionNo);
  blank.tokens = blankSection;

  return blankSection;
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

  optionGroup.makeOption(optionNo);

  return optionSection;
}

function analyzeQuestionNotes(question, section) {

}

/** 遍历tokens找出name的<name>_open和<name>_open的范围*/
function* findTokenSections(name, tokenSection) {

  let openTagName = name + '_open';
  let closeTagName = name + '_close';

  let lastBgnIdx, lastEndIdx;

  let bgnIndex = tokenSection.bgnIndex;
  let endIndex = tokenSection.endIndex;

  for (let idx = bgnIndex; idx <= endIndex; idx++) {

    let token = tokenSection.get(idx);

    if (token.type == openTagName) {
      lastBgnIdx = idx;

    } else if (token.type == closeTagName) {
      lastEndIdx = idx;

      yield tokenSection.new(lastBgnIdx, lastEndIdx);
    }
  }
}
