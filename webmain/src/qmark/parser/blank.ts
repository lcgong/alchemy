// __(1)__  __( )__ __()__ 至少2个下划线
export function parseQuestionBlank(state, silent) {

  var ch = state.src[state.pos];
  if (ch !== '_' && ch !== '—') { // tentatively probe this parser
    return false;
  }

  
  var ptn = /[_—]+[\(（]\s*(|[1-9][0-9]{0,2})\s*[）\)][_—]+/g;
  var matched = ptn.exec(state.src.slice(state.pos, state.posMax));
  if (matched == null) {
    return false;
  }

  let startPos = state.pos;
  let endPos   = startPos + ptn.lastIndex;  

  let blankNo = matched[1];


  if (!silent) {
    let token;
    token = state.push('question_blank_open', 'question-blank', 1);
    token.attrSet('no', blankNo);
    
    token = state.push('question_blank_close', 'question-blank', -1);
  }

  state.pos = endPos;

  return true;
}
