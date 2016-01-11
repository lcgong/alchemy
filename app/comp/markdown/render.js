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

function question_blank_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var meta = token.meta;

  var content = '';

  if (meta.questionNo != null) {
    content = meta.questionNo.toString();
  }

  var width = meta.width; // Math.trunc(meta.width/2);

  var h = ['<span class="question-blank" style="width:',
    width.toString(), 'ex">', content
  ];

  return h.join('');
}

function question_option_open(cssClass, tokens, idx, options, env, renderer) {
  // var token = tokens[idx];
  // var meta = token.meta;

  return '<div class="question_option">';
}

function question_option_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


function option_no_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var html = [
    '<div class="option-no">', token.meta.optionNo, '.'
  ].join('');

  return html;
}

function option_no_close(tokens, idx, options, env, renderer) {
  return '</div>';
}



function question_blank_close(tokens, idx, options, env, renderer) {
  return '</span>';
}

module.exports = {
  section_open: section_open,
  section_close: section_close,
  question_open: question_open,
  question_close: question_close,
  subquestion_open: subquestion_open,
  subquestion_close: subquestion_close,

  question_no_open: question_no_open,
  question_no_close: question_no_close,

  question_stem_open: question_stem_open,
  question_stem_close: question_stem_close,
  question_blank_open: question_blank_open,
  question_blank_close: question_blank_close,

  question_option_open: question_option_open,
  question_option_close: question_option_close,
  option_no_open: option_no_open,
  option_no_close: option_no_close,

};
