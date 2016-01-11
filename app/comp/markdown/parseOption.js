'use strict';


var isSpace = require('markdown-it/lib/common/utils').isSpace;


var questionOptionMarkerRegex =
  '^[\(（]([1-9a-zA-Z][0-9a-zA-Z]{0,2})\s*[,，]?\s*(.*)[\)）][:：]';

function parseQuestionOptionMarker(state, startLine) {
  var start = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];


  // match (A, ....): , chinese parenthesis, chines colon, chinese semicolon.
  var ptn = new RegExp(questionOptionMarkerRegex, 'g');
  var matched = ptn.exec(state.src.slice(start, max));
  if (matched == null) {
    return null;
  }

  var markerStr = matched[0];
  var optionNo = matched[1];
  var settingsStr = matched[2];
  var endIndex = ptn.lastIndex;

  var settings = {
    fixed: false,
    solo: false
  };

  ptn = /(固定|独行)[\,，]?\s*/g;
  while ((matched = ptn.exec(settingsStr)) != null) {
    if (matched[1] === '固定') {
      settings.fixed = true;
    } else if (matched[1] === '独行') {
      settings.solo = true;
    }
  }

  return {
    nextPos: start + endIndex,
    optionNo: optionNo,
    settings: settings,
    markerStr: markerStr
  }
}

function parseOption(state, startLine, endLine, silent) {
  var nextLine, lastLineEmpty,
    oldTShift, oldSCount, oldBMarks, oldIndent, oldParentType,
    lines, initial, offset, ch, terminatorRules, token, i, l, terminate;

  var pos = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];

  var ch = state.src[pos];
  if (ch !== '(' && ch !== '（') {
    return false;
  }


  // check the question option marker: '(A):' or '(B):'
  var marker = parseQuestionOptionMarker(state, startLine);
  if (marker == null) {
    return false;
  }


  pos = marker.nextPos;

  // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode
  if (silent) {
    return true;
  }

  // skip one optional space (but not tab, check cmark impl) after '>'
  if (state.src.charCodeAt(pos) === 0x20) {
    pos++;
  }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;

  // skip spaces after ">" and re-calculate offset
  initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

  oldBMarks = [state.bMarks[startLine]];
  state.bMarks[startLine] = pos;


  while (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (isSpace(ch)) {
      if (ch === 0x09) {
        offset += 4 - offset % 4;
      } else {
        offset++;
      }
    } else {
      break;
    }

    pos++;
  }

  lastLineEmpty = pos >= max;

  oldSCount = [state.sCount[startLine]];
  state.sCount[startLine] = offset - initial;

  oldTShift = [state.tShift[startLine]];
  state.tShift[startLine] = pos - state.bMarks[startLine];

  // terminatorRules = state.md.block.ruler.getRules('blockquote');

  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < oldIndent) {
      break;
    }

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    // console.log(111, state.src[pos]);


    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }


    if (state.src[pos] === '(' || state.src[pos] === '（') {
      var ptn = new RegExp(questionOptionMarkerRegex, 'g');
      var matched = ptn.exec(state.src.slice(pos, max));
      if (matched != null) {
        break;
      }
    }

    // question/section/subquestion marker: #1 ##1 ###1
    if (ch === '#') { // 遇到题号则结束本选项
      var ptn = /^(#{1,3})([1-9][0-9]{0,2})/;
      matched = ptn.exec(state.src.slice(pos, max));
      if (matched != null) {
        break;
      }
    }

    // solution marker: %%%
    if (state.src[pos] === '%' && state.src.slice(pos + 1, pos + 3) === '%%') {
      break;
    }

    // Case 3: another tag found.
    // terminate = false;
    // for (i = 0, l = terminatorRules.length; i < l; i++) {
    //   if (terminatorRules[i](state, nextLine, endLine, true)) {
    //     terminate = true;
    //     break;
    //   }
    // }
    // if (terminate) {
    //   break;
    // }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);

    // A negative indentation means that this is a paragraph continuation
    state.sCount[nextLine] = -1;
  }

  oldParentType = state.parentType;
  state.parentType = 'question_option';

  token = state.push('question_option_open', 'div', 1);
  token.markup = marker.markerStr;
  token.map = lines = [startLine, nextLine];
  token.meta = marker.settings;

  // 解析选项号
  pushOptionNoTokens(state, marker.optionNo, startLine, startLine + 1);

  state.md.block.tokenize(state, startLine, nextLine);

  token = state.push('question_option_close', 'div', -1);
  token.markup = marker.markerStr;

  state.parentType = oldParentType;
  // lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
  }
  state.blkIndent = oldIndent;

  state.line = nextLine;

  return true;
}

function pushOptionNoTokens(state, optionNo, startLine, endLine) {
  var token;
  var oldParentType = state.parentType;

  state.parentType = 'option_no';
  token = state.push('option_no_open', 'div', 1);
  token.block = true;
  token.map = [startLine, endLine];
  token.meta = {
    optionNo: optionNo
  };

  token = state.push('option_no_close', 'div', -1);

  state.parentType = oldParentType;
}

module.exports = {
  parseTokens: parseOption,
  markerRegex: questionOptionMarkerRegex
};
