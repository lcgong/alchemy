function section_open(tokens, idx, options, env, renderer) {
  return _question_open('section', tokens, idx, options, env, renderer);
}

function section_close(tokens, idx, options, env, renderer) {
  return _question_close('section', tokens, idx, options, env, renderer);
}

function question_open(tokens, idx, options, env, renderer) {
  return _question_open('question', tokens, idx, options, env, renderer);
}

function question_close(tokens, idx, options, env, renderer) {
  return _question_close('question', tokens, idx, options, env, renderer);
}

function subquestion_open(tokens, idx, options, env, renderer) {
  return _question_open('subquestion', tokens, idx, options, env, renderer);
}

function subquestion_close(tokens, idx, options, env, renderer) {
  return _question_close('subquestion', tokens, idx, options, env, renderer);
}


function _question_open(cssClass, tokens, idx, options, env, renderer) {
  var token = tokens[idx];
  var meta = token.meta;

  var questionNo = '';
  if (meta != undefined && meta.questionNo != null) {
    questionNo = meta.questionNo.toString();
  }

  var html = [
    '<div class="', cssClass, '">',
  ].join('');

  return html;

}

function _question_close(tokens, idx, options, env, renderer) {
  return '</div>';
}

function question_no_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var html = [
    '<div class="question-no">', token.meta.questionNo, '.'
  ].join('');

  return html;
}

function question_no_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


function question_stem_open(tokens, idx, options, env, renderer) {
  return '<div class="question-stem">';
}

function question_stem_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


export function register(rules) {
  rules.section_open = section_open;
  rules.section_close = section_close;
  rules.question_open = question_open;
  rules.question_close = question_close;
  rules.subquestion_open = subquestion_open;
  rules.subquestion_close = subquestion_close;

  rules.question_no_open = question_no_open;
  rules.question_no_close = question_no_close;

  rules.question_stem_open = question_stem_open;
  rules.question_stem_close = question_stem_close;
}
