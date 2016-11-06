import {Question, Subquestion} from "./model";
import {TokenSection, findTokenSections} from "./token";

export function analyzeOptionGroup(question, section) {

  // 因为解析问题，可能存在多个OptionGroup，需要将多个合并
  let groupSections = [...findTokenSections('option_group', section)];
  if (!groupSections || groupSections.length == 0)
    return;

  let groupSection = groupSections[0];

  let optionGroup = question.makeOptionGroup()
  optionGroup.tokens = section.new(groupSection);

  let xpath;
  if (question instanceof Subquestion) { // subquestion [0, 0]
      xpath = question.xpath.slice();
  } else if (question instanceof Question) { // question [null, 0]
      xpath = [null].concat(question.xpath); // the subquestion num is none
  }

  // as option group's xpath
  optionGroup.xpath = xpath.slice();
  if (!groupSection.first.meta) {
    groupSection.first.meta = {};
  }
  groupSection.first.meta.xpath = optionGroup.xpath.slice();

  xpath = [null].concat(xpath); // ['A', 0, 1] or ['A', null, 0]
  for(let optionSection of findTokenSections('blank_option', groupSection)) {


    let optNoSection = findTokenSections('option_no', optionSection).next().value;
    console.assert(optNoSection);

    let optionNo = optNoSection.first.meta.optionNo;
    console.assert(optionNo);

    let option = optionGroup.makeOption(optionNo);
    option.tokens = optionSection;

    xpath[0] = optionNo;

    option.xpath = xpath.slice();
    optionSection.first.meta.xpath = xpath.slice();

    // console.log(xpath);
  }

  let endIndex = groupSections[groupSections.length - 1].endIndex;
  return groupSections[0].new(groupSections[0].bgnIndex, endIndex);
}
