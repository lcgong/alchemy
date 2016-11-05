export function section_open(tokens, idx, options, env, renderer) {
  return _question_open('section', tokens, idx, options, env, renderer);
}

export function section_close(tokens, idx, options, env, renderer) {
  return _question_close('section', tokens, idx, options, env, renderer);
}

export function question_open(tokens, idx, options, env, renderer) {
  return _question_open('question', tokens, idx, options, env, renderer);
}

export function question_close(tokens, idx, options, env, renderer) {
  return _question_close('question', tokens, idx, options, env, renderer);
}

export function subquestion_open(tokens, idx, options, env, renderer) {
  return _question_open('subquestion', tokens, idx, options, env, renderer);
}

export function subquestion_close(tokens, idx, options, env, renderer) {
  return _question_close('subquestion', tokens, idx, options, env, renderer);
}


export function _question_open(cssClass, tokens, idx, options, env, renderer) {
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

export function _question_close(tokens, idx, options, env, renderer) {
  return '</div>';
}

export function question_no_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var html = [
    '<div class="question-no">', token.meta.questionNo, '.'
  ].join('');

  return html;
}

export function question_no_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


export function question_stem_open(tokens, idx, options, env, renderer) {
  return '<div class="question-stem">';
}

export function question_stem_close(tokens, idx, options, env, renderer) {
  return '</div>';
}

export function question_blank_open(tokens, idx, options, env, renderer) {
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

export function question_blank_close(tokens, idx, options, env, renderer) {
  return '</span>';
}

export function question_option_open(cssClass, tokens, idx, options, env, renderer) {
  // var token = tokens[idx];
  // var meta = token.meta;

  return '<div class="options">';
}

export function question_option_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


export function option_item_open(cssClass, tokens, idx, options, env, renderer) {
  // var token = tokens[idx];
  // var meta = token.meta;

  return '<div class="option-item">';
}

export function option_item_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


export function option_no_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var html = [
    '<div class="option-no">', token.meta.optionNo,
  ].join('');

  return html;
}

export function option_no_close(tokens, idx, options, env, renderer) {
  return '</div>';
}

export function question_notes_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var html = [
    '<div class="question-notes">'
  ].join('');

  return html;
}

export function question_notes_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


// module.exports = {
//   section_open: section_open,
//   section_close: section_close,
//   question_open: question_open,
//   question_close: question_close,
//   subquestion_open: subquestion_open,
//   subquestion_close: subquestion_close,
//
//   question_no_open: question_no_open,
//   question_no_close: question_no_close,
//
//   question_stem_open: question_stem_open,
//   question_stem_close: question_stem_close,
//   question_blank_open: question_blank_open,
//   question_blank_close: question_blank_close,
//
//   question_option_open: question_option_open,
//   question_option_close: question_option_close,
//
//   option_item_open: option_item_open,
//   option_item_close: option_item_close,
//
//   option_no_open: option_no_open,
//   option_no_close: option_no_close,
//
//   question_notes_open: question_notes_open,
//   question_notes_close: question_notes_close
// };
