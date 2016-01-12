'use strict';

// (O) (V) U+2714 ✔ heavy check mark
// (X)     U+2718 ✘ HEAVY BALLOT X (bold cross)

var markerStr = '%%%';

function parseSolution(state, startLine, endLine, silent) {
  var pos, nextLine, marker_count, markup, params, token,
    old_parent, old_line_max,
    auto_closed = false,
    start = state.bMarks[startLine] + state.tShift[startLine],
    max = state.eMarks[startLine];

  if (state.src.slice(start, start + markerStr.length) !== markerStr) {
    return false;
  }

  pos = start + markerStr.length;

  var paramsStr = state.src.slice(pos, max);
  var resolvedOptions = [];
  var matched;
  var optionPattern = /\(([0-9a-zA-Z]+)\)/g;
  while ((matched = optionPattern.exec(paramsStr)) != null) {
    resolvedOptions.push(matched[1]);
  }

  // Since start is found, we can report success here in validation mode
  if (silent) {
    return true;
  }

  // Search for the end of the block
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (state.src.slice(pos, pos + markerStr.length) === markerStr) {
      break;
    }

    // pos = start + markerStr.length;
    //
    // // make sure tail has spaces only
    // pos = state.skipSpaces(pos);
    // if (pos < max) {
    //   continue;
    // }
    //
    // // found!
    // auto_closed = true;
    // break;
  }

  old_line_max = state.lineMax;
  old_parent = state.parentType;
  state.parentType = 'question_notes';

  // this will prevent lazy continuations from ever going past our end marker
  state.lineMax = nextLine;

  token = state.push('question_notes_open', 'div', 1);
  token.markup = markerStr;
  token.block = true;
  token.info = resolvedOptions;
  token.map = [startLine, nextLine];
  token.attrPush(['solution', resolvedOptions]);

  state.md.block.tokenize(state, startLine + 1, nextLine);

  token = state.push('question_notes_close', 'div', -1);
  token.markup = markerStr;
  token.block = true;

  state.parentType = old_parent;
  state.lineMax = old_line_max;


  console.log('sol', state.line, nextLine);

  state.line = nextLine; // + (auto_closed ? 1 : 0);

  return true;
}


module.exports = parseSolution;
