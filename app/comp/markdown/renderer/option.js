


function question_option_open(cssClass, tokens, idx, options, env, renderer) {
  // var token = tokens[idx];
  // var meta = token.meta;

  return '<div class="options">';
}

function question_option_close(tokens, idx, options, env, renderer) {
  return '</div>';
}


function option_item_open(cssClass, tokens, idx, options, env, renderer) {
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

export function register(rules) {
  rules.question_option_open = question_option_open;
  rules.question_option_close = question_option_close;

  rules.option_item_open = option_item_open;
  rules.option_item_close = option_item_close;

  rules.option_no_open = option_no_open;
  rules.option_no_close = option_no_close;
}
