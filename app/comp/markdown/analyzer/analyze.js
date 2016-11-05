import {Question} from "./model";
import {TokenSection, findTokenSections} from "./token";
import {analyzeNotes, reformSolutions} from "./solution";


export function analyze(tokens) {

  let questions = [];

  let section = new TokenSection(tokens, 0, tokens.length - 1);

  let xpath = [0];
  for(let questionSection of findTokenSections('question', section)) {
    let question = new Question();
    question.xpath = xpath.slice(); // cloned
    question.tokens = questionSection;
    questions.push(question);

    analyzeQuestion(question, questionSection);

    xpath[0] += 1;
  }

  return questions;
}

function analyzeQuestion(question, section) {

  let bgnIdx;

  let subquestionSections = [...findTokenSections('subquestion', section)];

  let xpath = [0].concat(question.xpath); // [0, question_path_num]

  for(let subquestionSection of subquestionSections) {
    // subquestionSection.first.meta. = idx;

    let subquestion = question.makeSubquestion();
    subquestion.tokens = subquestionSection;
    subquestion.xpath = xpath.slice();

    analyzeSubquestion(subquestion);

    xpath[0] += 1;
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

function analyzeSubquestion(subquestion) {

  let section = subquestion.tokens;

  let optgrpSection = analyzeOptionGroup(subquestion, section);

  let endIndex;
  if (optgrpSection) {
    endIndex = optgrpSection.bgnIndex - 1
  } else {
    endIndex = section.endIndex;
  }

  analyzeAllBlank(subquestion, section.bgnIndex, endIndex);

  analyzeNotes(subquestion, section)
}

/** 解析question和subquestion问中的题空
 */
function analyzeAllBlank(question, bgnIdx, endIdx) {

  let section = question.tokens.new(bgnIdx, endIdx);

  let xpath = [0].concat(question.xpath); // [0, question_path_num]

  for(let blankSection of findTokenSections('question_blank', section, true)) {

    let token = blankSection.get(blankSection.bgnIndex);

    let blank = question.bindBlank(token.meta.questionNo);
    blank.tokens = blankSection;
    blank.xpath = xpath.slice();

    xpath[0] += 1;
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
