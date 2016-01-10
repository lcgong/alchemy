
function question_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];
  var meta =  token.meta;

  var content = '';

  if (meta.questionNo != null) {
      content = meta.questionNo.toString();
  }

  var width = meta.width;  // Math.trunc(meta.width/2);

  var h = ['<span class="question-blank" style="width:',
    width.toString(), 'ex">', content
  ];

  return h.join('');
  
}

function question_close(tokens, idx, options, env, renderer) {
  return '</div>';
}

function question_blank_open(tokens, idx, options, env, renderer) {
  var token = tokens[idx];

  var meta =  token.meta;

  var content = '';

  if (meta.questionNo != null) {
      content = meta.questionNo.toString();
  }

  var width = meta.width;  // Math.trunc(meta.width/2);

  var h = ['<span class="question-blank" style="width:',
    width.toString(), 'ex">', content
  ];

  return h.join('');
}


function question_blank_close(tokens, idx, options, env, renderer) {
  return '</span>';
}



module.exports = {
  question_blank_open: question_blank_open,
  question_blank_close: question_blank_close,
  question_open: question_open,
  question_close: question_close
};
