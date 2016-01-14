"use strict";


var space = " ";

/** 遍历Token，生成Question对象 */
function transform(obj, tokens, depth, bgnIndex, endIndex) {

  var nextIndex = bgnIndex;

  while (nextIndex < endIndex) {
    var token = tokens[nextIndex];
    var type = token.type;

    // console.log('token: ', depth, nextIndex, token.type);

    if (type.endsWith('_open')) {
      var name = type.slice(0, type.length - 5);
      var rule = transformRules[name];
      if (rule !== undefined) {
        obj = rule(name, token, obj, true);
      }

      nextIndex = transform(obj, tokens, depth + 1, nextIndex + 1, endIndex);
      nextIndex += 1;
      continue;

    } else if (type.endsWith('_close')) {
      var name = type.slice(0, type.length - 6);
      var rule = transformRules[name];
      if (rule !== undefined) {
        rule(name, token, obj, false);
      }

      return nextIndex;
    }

    if (token.children != null) {
      var children = token.children;

      transform(obj, children, depth + 1, 0, children.length);
    }

    nextIndex += 1;
  }
}

var transformRules = {
  'question': transformQuestion,
  'subquestion': transformSubquestion,
  'question_stem': transformQuestionStem,
  'question_blank': transformQuestionBlank,
  'question_no': transformQuestionNo,
  'question_option': transformQuestionOption,
  'option_item': transformOptionItem,
  'option_no': transformOptionNo,
  'question_notes': transformQuestionNotes
}


function transformQuestion(name, token, questionList, open) {
  if (open) {

    var question = {
      type: 'question',
    };
    // questionList.push(question);

    return question;
  } else {
    return questionList;
  }
}

function transformSubquestion(name, token, question, open) {
  if (open) {
    console.log('++++', name, question)

    var subquestion = {
      type : 'subquestion',
      blanks: [],
      parent: question,
    }

    return subquestion;
  } else {
    console.log('----', name, question)

    return question;
  }
}

function transformQuestionStem(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)

    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}

function transformQuestionNo(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)
    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}

function transformQuestionOption(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)
    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}


function transformOptionItem(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)
    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}

function transformOptionNo(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)
    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}

function transformQuestionBlank(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)
    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}

function transformQuestionNotes(name, token, parent, open) {
  if (open) {
    console.log('++++', name, parent)
    return parent;
  } else {
    console.log('----', name, parent)

    return parent;
  }
}

// function blank(token, ) {
//   if (type === '') {
//
//   } else if (type ==)
// }

module.exports = transform;
