'use strict';

var isSpace = require('markdown-it/lib/common/utils').isSpace;
var optionMarkerRegex = require('./parseOption').markerRegex;


var settingsPattern = ['(', [
  '选择题', '单选题', '多选题', '判断题', '填空题',
  '一行一项', '一行两项', '一行四项',
  '固定'
].join('|'), ')\s*'].join('');


function parseQuestion(state, startLine, endLine, silent) {
  var ch, level, tmp, token;

  var pos = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];

  if (state.src[pos] !== '#') { // tentatively probe
    return false;
  }


  var matched;
  var ptn = /^(#{1,3})([1-9][0-9]{0,2})\s+(.*)/g;
  matched = ptn.exec(state.src.slice(pos, max));
  if (matched == null) {
    return null;
  }

  var levelMarker = matched[1];
  var questionNo = parseInt(matched[2]);
  var questionSettingsStr = matched[3];

  ptn = new RegExp(settingsPattern, 'g');
  var questionSettings = [];
  while ((matched = ptn.exec(questionSettingsStr)) != null) {
    questionSettings.push(matched[1]);
  }

  if (silent) {
    return true;
  }

  var level = levelMarker.length;

  var oldIndent = state.blkIndent;
  state.blkIndent = 0;


  var sublevelStartLine = null;
  var optionStartLine = null;

  endLine = state.lineMax;
  var nextLine;
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < oldIndent) {
      break;
    }

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    var ch = state.src[pos];
    if (ch === '#') { // 遇到同级别或高级别的题号，结束本题内容
      var ptn = /^(#{1,3})([1-9][0-9]{0,2})/;
      matched = ptn.exec(state.src.slice(pos, max));

      if (matched != null && matched[1].length <= level) {
        // 依据'#'的个数判断，遇到高级的结束
        break;

      } else if (matched[1].length > level) {
        // 找到第一次出现的小题或子题的行号位置
        if (sublevelStartLine == null) {
          sublevelStartLine = nextLine;
        }
      }

    } else if (optionStartLine == null && (ch === '(' || ch === '（')) {
      // 找到第一次出现选项的行号
      var ptn = new RegExp(optionMarkerRegex, 'g');
      matched = ptn.exec(state.src.slice(pos, max));
      if (matched != null) {
        optionStartLine = nextLine;
      }

    }
  }

  state.line = nextLine;

  var oldParentType = state.parentType;
  state.parentType = 'question';

  var beginTagName, endTagName;
  if (level === 1) {
    beginTagName = 'section_open';
    endTagName = 'section_close';
  } else if (level === 2) {
    beginTagName = 'question_open';
    endTagName = 'question_close';
  } else if (level === 3) {
    beginTagName = 'subquestion_open';
    endTagName = 'subquestion_close';
  }

  var markerStr = levelMarker + questionNo;
  token = state.push(beginTagName, 'div', 1);
  token.markup = markerStr;
  token.block = true;
  token.map = [startLine, nextLine];
  token.meta = {};
  parseSettings(token, questionSettings);

  var stemEndLine = null;
  if (sublevelStartLine != null && optionStartLine != null) {
    stemEndLine = Math.min(sublevelStartLine, optionStartLine);
  } else if (sublevelStartLine != null) {
    stemEndLine = sublevelStartLine;
  } else if (optionStartLine != null) {
    stemEndLine = optionStartLine;
  } else {
    stemEndLine = nextLine;
  }

  pushQuestionNoTokens(state, questionNo, startLine, startLine + 1);

  // question-stem
  if (startLine + 1 < stemEndLine) {
    pushQuestionStemTokens(state, startLine + 1, stemEndLine);
  }

  if (stemEndLine, nextLine) {
    state.md.block.tokenize(state, stemEndLine, nextLine);
  }

  token = state.push(endTagName, 'div', -1);
  token.markup = markerStr;

  state.parentType = oldParentType;

  return true;

};

function pushQuestionNoTokens(state, questionNo, startLine, endLine) {
  var token;
  var oldParentType = state.parentType;

  state.parentType = 'question_no';
  token = state.push('question_no_open', 'div', 1);
  token.block = true;
  token.map = [startLine, endLine];
  token.meta = {
    questionNo: questionNo
  };

  token = state.push('question_no_close', 'div', -1);

  state.parentType = oldParentType;
}

function pushQuestionStemTokens(state, startLine, endLine) {
  var token;
  var oldParentType = state.parentType;

  state.parentType = 'question_stem';
  token = state.push('question_stem_open', 'div', 1);
  token.block = true;
  token.map = [startLine, endLine];

  state.md.block.tokenize(state, startLine, endLine);

  token = state.push('question_stem_close', 'div', -1);

  state.parentType = oldParentType;
}

/** parse question stem from question.
 */
function parseQuestionStem(state, startLine, endLine) {

}


function parseSettings(token, settings) {

  var fixed = false;

  for (var i = 0, n = settings.length; i < n; i++) {
    var item = settings[i];

    var attrName = 'questionType';

    if (item === '单选题' || item === '多选题' ||
      item === '判断题' || item === '填空题') {

      token.meta[attrName] = item;
      continue;
    }

    if (item === '选择题') {
      token.meta[attrName] = '单选题';
      continue;
    }

    var attrName = 'columnCount';
    if (item === '一行一项') {
      token.meta[attrName] = 1;
      continue;

    } else if (item === '一行两项') {
      token.meta[attrName] = 2;
      continue;

    } else if (item === '一行四项') {
      token.meta[attrName] = 4;
      continue;

    }

    if (item === '固定') {
      fixed = true;
      continue;

    }
  }

  token.meta['fixed'] = fixed;
}



module.exports = parseQuestion;
