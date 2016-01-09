'use strict';

var markerStr = '%%%';

function parseSolution(state, startLine, endLine, silent) {
  var pos, nextLine, marker_count, markup, params, token,
    old_parent, old_line_max,
    auto_closed = false,
    start = state.bMarks[startLine] + state.tShift[startLine],
    max = state.eMarks[startLine];


  if (state.src.substr(start, markerStr.length) !== markerStr) {
    return false;
  }

  pos = start + markerStr.length;

  var paramsStr = state.src.slice(pos, max);
  var optionPattern = /\(([0-9a-zA-Z]+)\)/g;
  var resolvedOptions = [];
  var matched;
  while( ( matched = optionPattern.exec(paramsStr) ) != null ) {
    resolvedOptions.push(matched[1]);
  }

  console.log(resolvedOptions);

  // Since start is found, we can report success here in validation mode
  //
  if (silent) {
    return true;
  }

  // Search for the end of the block
  //
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    start = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (start < max && state.sCount[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.substr(start, markerStr.length) !== markerStr) {
      continue;
    }

    pos = start + markerStr.length;

    // make sure tail has spaces only
    pos = state.skipSpaces(pos);

    if (pos < max) {
      continue;
    }

    // found!
    auto_closed = true;
    break;
  }

  console.log(7777, startLine, nextLine);

  old_parent = state.parentType;
  old_line_max = state.lineMax;
  state.parentType = 'question_solution';

  // this will prevent lazy continuations from ever going past our end marker
  state.lineMax = nextLine;

  token = state.push('question_solution_open', 'div', 1);
  token.markup = markerStr;
  token.block = true;
  token.info = resolvedOptions;
  token.map = [startLine, nextLine];
  token.attrPush(['solution', resolvedOptions]);

  state.md.block.tokenize(state, startLine + 1, nextLine);

  token = state.push('question_solution_close', 'div', -1);
  token.markup = markerStr;
  token.block = true;

  state.parentType = old_parent;
  state.lineMax = old_line_max;
  state.line = nextLine + (auto_closed ? 1 : 0);

  return true;
}


module.exports = parseSolution;
