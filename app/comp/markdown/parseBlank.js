'use strict';


function parseQuestionBlank(state, silent) {
  var pos, token;
  var max = state.posMax;

  var start = state.pos;
  var ch = state.src[state.pos];
  if (ch !== '_' && ch !== '—') { // tentatively probe this parser
    return false;
  }

  pos = start;

  // __(1)__  __( )__
  var ptn = /[_—]+[\(（]\s*(|[1-9][0-9]{0,2})\s*[）\)][_—]+/g;
  var matched = ptn.exec(state.src.slice(pos, max));
  if (matched == null) {
    return false;
  }

  pos = start + ptn.lastIndex;
  var questionNoStr = matched[1];
  var questionNo = (questionNoStr.length > 0) ? parseInt(questionNoStr) : null;


  if (!silent) {
    token = state.push('question_blank_open', 'span', 1);
    token.attrPush(['questionNo', questionNo]);

    token = state.push('question_blank_close', 'span', -1);
  }

  state.pos = pos;
  state.posMax = max;

  return true;
};


module.exports = parseQuestionBlank;
