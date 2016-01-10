/**
Question JSON Schema:
题干 stem

json: [section]
section: {
  stem: string,
  questions: [question]
}

question: {
  stem: string,
  subquestion: [subquestion],
  options: [option], // 没有subquestion时有options和solution
  answer: string
  criterion: string
}

subquestion: {
  stem: ,
  options: ,
  answer: string
  criterion: string
}

*/


function encode(tokens) {
  console.log(99999, tokens.length)
  return parseTokenList(tokens, 0, tokens.length - 1);
}

function parseTokenList(tokens, start, stop) {

  console.log(8888, stop - start + 1, tokens.slice(start, stop + 1))

  var item = null;
  var items = [];

  var tagEndIndex;

  var n = tokens.length;
  var i = start;
  while (i <= stop) {
    var token = tokens[i];

    var token_type = token.type;

    console.log(i, token_type, 3333)

    // section, question, subquestion  _open, _close
    var blockType = blockTokenTypes[token_type];
    if (blockType !== undefined) {
      var endTagName = blockType + '_close';

      for (var endTagIndex = i; endTagIndex <= stop; endTagIndex++) {
        if (tokens[endTagIndex].type === endTagName) {
          break;
        }
      }

      console.log(blockType, 4444, endTagIndex);


      if (endTagIndex > stop) {
        throw "No matched : " + endTagName;
      }

      item = parseBlockTokens(tokens, blockType, i, endTagIndex);

      items.push(item);

      i = endTagIndex + 1;
      continue;
    }

    throw "unkown token" + token.type;

    break;
  }

  return items;
}

var blockTokenTypes = {
  'section_open': 'section',
  'question_open': 'question',
  'subquestion_open': 'subquestion',
  'question_option_open': 'question_option',
  'question_solution_open': 'question_solution',
  'paragraph_open': 'paragraph',
}


function parseBlockTokens(tokens, type, start, stop) {
  var token;
  var item = {};

  if (type === "paragraph") {
    token = tokens[start + 1];
    if (stop - start != 2 || token.type != 'inline') {
      throw "ERROR"
    }

    parseTokenList(token.children, 0, token.children.length - 1)


    item.content = token.content;

  } else {
    item.objectType = type;

    console.log(7777, type, tokens.slice(start, stop + 1))

    token = tokens[start];
    parseBlockTokenAttrs(item, token.attrs);

    var items = parseTokenList(tokens, start + 1, stop - 1)

    item.tokens = items;
  }


  console.log(111, items)

  return item;
}

function decode(json) {

}


function parseBlockTokenAttrs(obj, attrList) {
  if (attrList == undefined) {
    return;
  }

  for (var k = 0, n = attrList.length; k < n; k++) {
    obj[attrList[k][0]] = attrList[k][1];
  }
}



module.exports = {
  encode: encode,
  decode: decode
}
