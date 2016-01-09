'use strict';

var isSpace = require('markdown-it/lib/common/utils').isSpace;


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
  matched = ptn.exec(state.src.substr(pos, max));
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

  var oldIndent = state.blkIndent;
  state.blkIndent = 0;

  endLine = state.lineMax;
  var nextLine;
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < oldIndent) {
      break;
    }

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (state.src[pos] === '#') { // 遇到同级别或高级别的题号，结束本题内容
      var ptn = /^(#{1,3})([1-9][0-9]{0,2})/;
      matched = ptn.exec(state.src.substr(pos, max));

      if (matched != null && matched[1].length <= levelMarker.length) {
        // 依据'#'的个数判断
        break;
      }
    }
  }

  state.line = nextLine;

  var oldParentType = state.parentType;
  state.parentType = 'question';

  token = state.push('question_open', 'div', 1);
  token.markup = levelMarker + questionNo;
  token.block = true;
  token.map = [startLine, nextLine];
  token.attrPush(['level', levelMarker.length]);
  token.attrPush(['settings', questionSettings]);

  state.md.block.tokenize(state, startLine + 1, nextLine);

  token = state.push('question_close', 'div', -1);
  token.markup = levelMarker + questionNo;

  state.parentType = oldParentType;

  return true;

};


module.exports = parseQuestion;
