import { questionOptionMarkerRegex } from './option';

var settingsPattern = ['(', [
    '选择题', '单选题', '多选题', '判断题', '填空题',
    '一行一项', '一行两项', '一行四项',
    '固定'
].join('|'), ')\\s*'].join('');


export function parseQuestion(state, startLine, endLine, silent) {
    var ch, token;


    var pos = state.bMarks[startLine] + state.tShift[startLine];
    var max = state.eMarks[startLine];

    if (state.src[pos] !== '#') { // tentatively probe
        return false;
    }

    var ptn = /^(#{2,3})([1-9][0-9]{0,2})\s+(.*)/g;
    let matched = ptn.exec(state.src.slice(pos, max));
    if (matched == null) {
        return null;
    }

    var levelMarker = matched[1];
    var questionNo = parseInt(matched[2], 10);
    var questionSettingsStr = matched[3];

    ptn = new RegExp(settingsPattern, 'g');
    var questionSettings = [];
    while ((matched = ptn.exec(questionSettingsStr)) != null) {
        questionSettings.push(matched[1]);
    }

    if (silent) {
        return true;
    }

    let level = levelMarker.length;

    var oldIndent = state.blkIndent;
    state.blkIndent = 0;


    // var sublevelStartLine = null;
    var stemBlockEndLine = null;

    endLine = state.lineMax;
    var nextLine;
    for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
        if (state.sCount[nextLine] < oldIndent) {
            break;
        }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        ch = state.src[pos];
        if (ch === '#') { // 遇到同级别或高级别的题号，结束本题内容
            ptn = /^(#{1,3})([1-9][0-9]{0,2})/;
            matched = ptn.exec(state.src.slice(pos, max));

            if (matched != null) {
                if (matched[1].length <= level) {
                    // 依据'#'的个数判断，遇到高级的结束
                    break;

                } else if (matched[1].length > level) {
                    // 找到第一次出现的小题或子题的行号位置
                    if (stemBlockEndLine == null) {
                        stemBlockEndLine = nextLine;
                    }
                }
            }

        } else if (stemBlockEndLine == null && (ch === '(' || ch === '（')) {
            // 找到第一次出现选项的行号
            ptn = new RegExp(questionOptionMarkerRegex, 'g');
            matched = ptn.exec(state.src.slice(pos, max));
            if (matched != null) {
                if (stemBlockEndLine == null) {
                    stemBlockEndLine = nextLine;
                }
            }

        } else if (ch === '%' && state.src.slice(pos + 1, pos + 3) === '%%') {
            if (stemBlockEndLine == null) {
                stemBlockEndLine = nextLine;
            }
        }
    }

    state.line = nextLine;

    var oldParentType = state.parentType;
    state.parentType = 'question';

    // var beginTagName, endTagName;

    let tokenType;
    if (level === 2) {
        tokenType = {
            open: "question_open",
            close: "question_close",
            tag: "question"
        };
    } else if (level === 3) {
        tokenType = {
            open: "subquestion_open",
            close: "subquestion_close",
            tag: "subquestion"
        };
    }


    var markerStr = levelMarker + questionNo;
    token = state.push(tokenType.open, tokenType.tag, 1);
    token.attrSet('no', questionNo);
    token.markup = markerStr;
    token.block = true;
    token.map = [startLine, nextLine];
    token.meta = {};
    parseSettings(token, questionSettings);

    // console.log(tokenType.tag, state);
    // console.log('level %d, token %d', token.level, state.tokens.length, tokenType.tag);


    if (stemBlockEndLine == null) {
        stemBlockEndLine = nextLine;
    }
    // var stemEndLine = (stemBlockEndLine != null) ? stemBlockEndLine: nextLine;
    // if (sublevelStartLine != null && stemBlockEndLine != null) {
    //   stemEndLine = Math.min(sublevelStartLine, stemBlockEndLine);
    // } else if (sublevelStartLine != null) {
    //   stemEndLine = sublevelStartLine;
    // } else if (stemBlockEndLine != null) {
    //   stemEndLine = stemBlockEndLine;
    // } else {
    //   stemEndLine = nextLine;
    // }

    // pushQuestionNoTokens(state, questionNo, startLine, startLine + 1);

    // debug.printBlockTokenState('k: ', state, startLine, stemBlockEndLine);

    // 题干生成 question stem
    if (startLine + 1 < stemBlockEndLine) {
        // 忽略连续空行，只有非空行才生产题干

        if (state.getLines(startLine + 1, stemBlockEndLine, 0).trim().length > 0) {

            pushQuestionStemTokens(state, startLine + 1, stemBlockEndLine);
        }
    }

    if (stemBlockEndLine < nextLine) {


        // 前面是题干，解析选项和答案
        state.md.block.tokenize(state, stemBlockEndLine, nextLine);
    }

    token = state.push(tokenType.close, tokenType.tag, -1);
    token.markup = markerStr;

    state.parentType = oldParentType;

    return true;
};

// function pushQuestionNoTokens(state, questionNo, startLine, endLine) {
//   var token;
//   var oldParentType = state.parentType;

//   state.parentType = 'question_no';
//   token = state.push('question_no_open', 'div', 1);
//   token.block = true;
//   token.map = [startLine, endLine];
//   token.meta = {
//     questionNo: questionNo
//   };

//   token = state.push('question_no_close', 'div', -1);

//   state.parentType = oldParentType;
// }

function pushQuestionStemTokens(state, startLine, endLine) {

    // console.log('>: ', startLine, state.bMarks[startLine], state.tShift[startLine],
    //   state.sCount[startLine], state.src[state.eMarks[startLine]].charCodeAt(0).toString(16),
    //   state.src.slice(state.bMarks[startLine], state.eMarks[startLine]))


    var token;
    var oldParentType = state.parentType;

    state.parentType = 'question_stem';
    token = state.push('question_stem_open', 'question-stem', 1);
    token.block = true;
    token.map = [startLine, endLine];

    state.md.block.tokenize(state, startLine, endLine);

    token = state.push('question_stem_close', 'question-stem', -1);

    state.parentType = oldParentType;
}

function parseSettings(token, settings) {

    var fixed = false;

    for (var i = 0, n = settings.length; i < n; i++) {
        var item = settings[i];

        var attrName = 'questionType';

        if (item === '单选题' || item === '多选题' ||
            item === '判断题' || item === '填空题') {

            token.meta[attrName] = item;
            continue;
        }

        if (item === '选择题') {
            token.meta[attrName] = '单选题';
            continue;
        }

        attrName = 'columnCount';
        if (item === '一行一项') {
            token.meta[attrName] = 1;
            continue;

        } else if (item === '一行两项') {
            token.meta[attrName] = 2;
            continue;

        } else if (item === '一行四项') {
            token.meta[attrName] = 4;
            continue;

        }

        if (item === '固定') {
            fixed = true;
            continue;

        }
    }

    token.meta['fixed'] = fixed;
}