'use strict';


var isSpace = require('markdown-it/lib/common/utils').isSpace;


function convertToHex(str) {
  var hex = '';
  for (var i = 0; i < str.length; i++) {
    hex += '\\' + str.charCodeAt(i).toString(16);
  }
  return hex;
}

function skipQuestionOptionMarker(state, startLine) {
  var start = state.bMarks[startLine] + state.tShift[startLine];
  var pos = start;
  var max = state.eMarks[startLine];

  if (state.src[pos] !== '(') {
    return -1;
  }

  while (++pos < max) {
    var ch = state.src.charCodeAt(pos);
    if ((ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) ||
        (ch >= 0x61/* a */ && ch <= 0x7a/* z */) ||
        (ch >= 0x41/* A */ && ch <= 0x5a/* Z */)) {

        if (pos - start >= 2) {
          // Question option marker should have no more than 2 digits
          return -1;
        }
    } else {
      break;
    }

  }

  if (state.src[pos] === ')' && state.src[pos + 1] === ':') {
    return pos + 1;
  }

  return -1;
}

function parseOption(state, startLine, endLine, silent) {
  var nextLine, lastLineEmpty, oldTShift, oldSCount, oldBMarks, oldIndent, oldParentType, lines, initial, offset, ch,
    terminatorRules, token,
    i, l, terminate,
    pos = state.bMarks[startLine] + state.tShift[startLine],
    max = state.eMarks[startLine];

  // check the question option marker: '(A):' or '(B):'
  var posAfterMarker = skipQuestionOptionMarker(state, startLine);
  if (posAfterMarker < 0) {
    return false;
  }

  var marker = state.src.substr(pos, posAfterMarker - pos + 1);
  pos = posAfterMarker + 1;

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

  terminatorRules = state.md.block.ruler.getRules('blockquote');

  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < oldIndent) {
      break;
    }

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src[pos++] === '(') {
      break;
    }

    // Case 3: another tag found.
    terminate = false;
    console.log(666655, terminatorRules)
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        console.log(666666, nextLine)
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);

    // A negative indentation means that this is a paragraph continuation
    state.sCount[nextLine] = -1;
  }

  oldParentType = state.parentType;
  state.parentType = 'question_option';

  token = state.push('question_option_open', 'question_option', 1);
  token.markup = marker;
  token.map = lines = [startLine, 0];

  state.md.block.tokenize(state, startLine, nextLine);

  token = state.push('question_option_close', 'question_option', -1);
  token.markup = marker;

  state.parentType = oldParentType;
  lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
  }
  state.blkIndent = oldIndent;

  return true;
};


module.exports = function question_option_plugin(md) {


  md.block.ruler.before('blockquote', 'question_option', parseOption, {
    alt: ['paragraph']
  });


  // md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
};
