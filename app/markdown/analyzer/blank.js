import {findTokenSections} from "./token";


/** 解析question和subquestion问中的题空
 */
export function analyzeAllBlank(question, bgnIdx, endIdx) {

  let section = question.tokens.new(bgnIdx, endIdx);

  for(let blankSection of findTokenSections('question_blank', section, true)) {

    let token = blankSection.first;

    let blank = question.bindBlank(token.meta.questionNo);
    blank.tokens = blankSection;
    token.meta.xpath = blank.xpath;
  }
}
