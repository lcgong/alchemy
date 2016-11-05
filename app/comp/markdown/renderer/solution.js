

function question_notes_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var html = [
    '<div class="question-notes">'
  ].join('');

  return html;
}

function question_notes_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


export function register(rules) {

  rules.question_notes_open = question_notes_open;
  rules.question_notes_close = question_notes_close;
}
