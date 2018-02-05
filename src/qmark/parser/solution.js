// (O) (V) U+2714 ✔ heavy check mark
// (X)     U+2718 ✘ HEAVY BALLOT X (bold cross)


var markerStr = '%%%';

export function parseSolution(state, startLine, endLine, silent) {
    var pos, nextLine, token,
        old_parent, old_line_max,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    if (state.src.slice(start, start + markerStr.length) !== markerStr) {
        return false;
    }

    pos = start + markerStr.length;

    var paramsStr = state.src.slice(pos, max);
    var resolvedOptions = parseBlankSolution(paramsStr);

    // Since start is found, we can report success here in validation mode
    if (silent) {
        return true;
    }

    // Search for the end of the block
    for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (state.src.slice(pos, pos + markerStr.length) === markerStr) {
            break;
        }

        // pos = start + markerStr.length;
        //
        // // make sure tail has spaces only
        // pos = state.skipSpaces(pos);
        // if (pos < max) {
        //   continue;
        // }
        //
        // // found!
        // auto_closed = true;
        // break;
    }

    old_line_max = state.lineMax;
    old_parent = state.parentType;
    state.parentType = 'solution';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    token = state.push('solution_open', 'solution', 1);
    token.markup = markerStr;
    token.block = true;
    // token.info = resolvedOptions;
    token.map = [startLine, nextLine];
    token.attrPush(['answer', resolvedOptions]);
    // token.meta = {
    //   solution: resolvedOptions
    // }

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token = state.push('solution_close', 'solution', -1);
    token.markup = markerStr;
    token.block = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;


    // console.log('sol', state.line, nextLine);

    state.line = nextLine; // + (auto_closed ? 1 : 0);

    return true;
}


/**
 * 解析下列
 *  1. (A) (B) (C) ; 2. (a) (c)
 *  1. (A) (B) (C)  2. (a) (c)
 *  (A) (B) (C) ; 2. (a) (c)
 *  (A) (B) (C) ; (a) (c)
 * 返回每组答案 [[1, A, B, C], [2, a, c]]
 * 如果没有题号用null表示  [[A, B, C], [a, c]]
 */
function parseBlankSolution(paramsStr) {
    let optionPattern = /([1-9][0-9]*)[.、]?|[(（]([a-zA-Z]+)[）)]|([;；。])/g;

    let resolvedOptions = [];
    let blankSolution = [null];
    let matched;
    while ((matched = optionPattern.exec(paramsStr)) != null) {
        if (matched[3]) { // 分号间隔
            if (blankSolution.length > 1 || blankSolution[0] != null) {
                resolvedOptions.push(blankSolution);
            }

            blankSolution = [null];

        } else if (matched[1]) {
            if (blankSolution.length > 1 || blankSolution[0] != null) {
                resolvedOptions.push(blankSolution);
            }

            blankSolution = [matched[1]];
        } else {
            if (matched[2]) {
                blankSolution.push(matched[2]);
            }
        }
    }

    if (blankSolution.length > 1 || blankSolution[0] != null) {
        resolvedOptions.push(blankSolution);
    }

    let ans = resolvedOptions
        .map((x) => `${x[0]?x[0]:''}:${x.slice(1).join(',')}`)
        .join(';')

    return ans;
}