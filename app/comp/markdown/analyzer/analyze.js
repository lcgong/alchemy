import {Question, Subquestion} from "./model";
import {TokenSection, findTokenSections} from "./token";
import {analyzeNotes, reformSolutions} from "./solution";
import {analyzeOptionGroup} from "./option";
import {analyzeAllBlank} from "./blank";

export function analyze(tokens) {

  let questions = [];

  let section = new TokenSection(tokens, 0, tokens.length - 1);

  let xpath = [0];
  for(let questionSection of findTokenSections('question', section)) {
    let question = new Question();
    question.xpath = xpath.slice(); // cloned
    question.tokens = questionSection;

    questionSection.first.meta.xpath = question.xpath;

    question.displayNo = 1;

    questions.push(question);

    analyzeQuestion(question, questionSection);

    xpath[0] += 1;
  }

  return questions;
}

function analyzeQuestion(question, section) {
  console.log(888888888883);

  let bgnIdx;

  let subquestionSections = [...findTokenSections('subquestion', section)];

  let xpath = [0].concat(question.xpath); // [0, question_path_num]

  let displayNo = 1;
  for(let subquestionSection of subquestionSections) {
    // subquestionSection.first.meta. = idx;

    let subquestion = question.makeSubquestion();
    subquestion.tokens = subquestionSection;
    subquestion.xpath = xpath.slice();
    subquestion.displayNo = displayNo;

    let tokenMeta = subquestionSection.first.meta;

    subquestion.columnCount = tokenMeta.columnCount
    subquestion.questionType = tokenMeta.questionType

    tokenMeta.xpath = subquestion.xpath;

    analyzeSubquestion(subquestion);

    xpath[0] += 1;
    displayNo += 1;
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
  console.log('33dddfffffffffffff')

  let section = subquestion.tokens;

  let optgrpSection = analyzeOptionGroup(subquestion, section);

  let endIndex;
  if (optgrpSection) {
    endIndex = optgrpSection.bgnIndex - 1
  } else {
    endIndex = section.endIndex;
  }

  analyzeAllBlank(subquestion, section.bgnIndex, endIndex);

  analyzeNotes(subquestion, section);
}
