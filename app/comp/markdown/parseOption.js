
import {debug} from './debug';
import {isSpace} from 'markdown-it/lib/common/utils';


export let questionOptionMarkerRegex =
  '^[\(（]([1-9a-zA-Z][0-9a-zA-Z]{0,2})\s*[,，]?\s*(.*)[\)）][:：]';

function parseQuestionOptionMarker(state, startLine) {
  var start = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];

  var ch = state.src[start];
  if (ch !== '(' && ch !== '（') {
    return null;
  }

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

  ptn = /(固定|独行|整行)[\,，]?\s*/g;
  while ((matched = ptn.exec(settingsStr)) != null) {
    if (matched[1] === '固定') {
      settings.fixed = true;
    } else if (matched[1] === '独行', matched[1] === '整行') {
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

export function parseOption(state, startLine, endLine, silent) {
  var nextLine,
    oldTShift, oldSCount, oldBMarks, oldIndent, oldParentType,
    initial, ch, terminatorRules, token, i, l, terminate;

  // check the question option marker: '(A):' or '(B):'
  var marker = parseQuestionOptionMarker(state, startLine);
  if (marker == null) {
    return false;
  }

  // console.log('O: ', startLine, state.bMarks[startLine], state.tShift[startLine],
  //             state.sCount[startLine], state.src[state.eMarks[startLine]].charCodeAt(0).toString(16),
  //             state.src.slice(state.bMarks[startLine], state.eMarks[startLine]))

  var pos = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];

  pos = marker.nextPos;

  if (silent) {
    return true;
  }

  // 跳过多余的空格
  if (state.src.charCodeAt(pos) === 0x20) {
    pos++;
  }

  oldIndent = state.blkIndent;
  state.blkIndent = 0; // 设置所需要的缩进为零

  var oldBMarks = [state.bMarks[startLine]];
  var oldSCount = [state.sCount[startLine]];
  var oldTShift = [state.tShift[startLine]];

  state.bMarks[startLine] = pos;

  // -------------------------------------------------------------------------
  oldParentType = state.parentType;
  state.parentType = 'question_option';

  var optionOpenToken = state.push('question_option_open', 'div', 1);
  // optionOpenToken.markup = marker.markerStr;
  // optionOpenToken.map = [startLine, 0];
  // optionOpenToken.meta = marker.settings;


  // while (pos < max) {
  //   ch = state.src.charCodeAt(pos);
  //
  //   if (isSpace(ch)) {
  //     if (ch === 0x09) {
  //       offset += 4 - offset % 4;
  //     } else {
  //       offset++;
  //     }
  //   } else {
  //     break;
  //   }
  //
  //   pos++;
  // }

  // console.log(333, pos, offset, initial, pos, state.bMarks[startLine]);


  // state.sCount[startLine] = offset - initial;
  state.tShift[startLine] = pos - state.bMarks[startLine];

  var oldOptionItemParentType = state.parentType;


  var optionItemStartLine = startLine;

  var optionItemOpenToken;
  optionItemOpenToken = state.push('option_item_open', 'div', 1);
  optionItemOpenToken.markup = marker.markerStr;
  optionItemOpenToken.meta = marker.settings;

  // 解析选项号
  pushOptionNoTokens(state, marker.optionNo,
      optionItemStartLine, optionItemStartLine + 1);


  // console.log('~~~~~~~~~~~~~~~~~');


  // terminatorRules = state.md.block.ruler.getRules('blockquote');

  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {

    // debug.printBlockTokenState('==: ', state, nextLine);
    // console.log('*: ', nextLine, optionItemStartLine, state.bMarks[nextLine],
    //   state.tShift[nextLine], state.sCount[nextLine], 's', state.sCount[startLine], state.src[state.eMarks[nextLine]].charCodeAt(0).toString(16),
    //             state.src.slice(state.bMarks[nextLine], state.eMarks[nextLine]))

    // if (state.sCount[nextLine] < oldIndent) {
    //   break;
    // }


    var newMarker = parseQuestionOptionMarker(state, nextLine);
    if (newMarker != null) {

      // 遇到新的选项，结束旧的标签，开始新的标签
      optionOpenToken.map = [optionItemStartLine, nextLine];

      // if (optionItemStartLine < nextLine) {
      //   // 相接两行的两个选项，无需进行解析，直接关闭
      //
      //   debug.printBlockTokenState('++++: ', state,
      //     optionItemStartLine, nextLine);
      //
      // }
      state.md.block.tokenize(state, optionItemStartLine, nextLine);

      var optionItemCloseToken;
      optionItemCloseToken = state.push('option_item_close', 'div', -1);
      optionItemCloseToken.markup = marker.markerStr;

      // 开始新标签
      optionItemStartLine = nextLine;
      marker = newMarker;

      oldBMarks.push(state.bMarks[nextLine]);
      oldTShift.push(state.tShift[nextLine]);
      oldSCount.push(state.sCount[nextLine]);

      state.bMarks[nextLine] = marker.nextPos;

      var optionItemOpenToken;
      optionItemOpenToken = state.push('option_item_open', 'div', 1);
      optionItemOpenToken.markup = marker.markerStr;
      optionItemOpenToken.meta = marker.settings;

      // 解析选项号
      pushOptionNoTokens(state, marker.optionNo,
          optionItemStartLine, optionItemStartLine + 1);
      continue;
    }

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    // 判断是否遇到新题号 question/section/subquestion marker: #1 ##1 ###1
    if (ch === '#') { // 遇到题号则结束本选项
      var ptn = /^(#{1,3})([1-9][0-9]{0,2})/;
      matched = ptn.exec(state.src.slice(pos, max));
      if (matched != null) {
        break;
      }
    }

    // 判断是否遇到答案和分析等 notes marker: %%%
    if (state.src[pos] === '%' && state.src.slice(pos + 1, pos + 3) === '%%') {
      break;
    }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);

    // A negative indentation means that this is a paragraph continuation
    // state.sCount[nextLine] = -1;
  }

  optionOpenToken.map = [optionItemStartLine, nextLine];

  state.md.block.tokenize(state, optionItemStartLine, nextLine);

  var optionItemCloseToken;
  optionItemCloseToken = state.push('option_item_close', 'div', -1);
  optionItemCloseToken.markup = marker.markerStr;

  state.parentType = oldOptionItemParentType;

  //----------------------------------------------------------------------

  // 设置question_option_open 开始和结束行号
  optionOpenToken.map = [startLine, nextLine];

  token = state.push('question_option_close', 'div', -1);
  token.markup = marker.markerStr;

  state.parentType = oldParentType;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
  }
  state.blkIndent = oldIndent;

  state.line = nextLine ;

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
