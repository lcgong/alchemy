// import { combineReducers } from 'redux';
import { createStore as _createStore } from 'redux';
import { bisect_toggle } from '../bisect';

//-------------------------------------------------------------------------

const FOCUS_BLANK = 'FOCUS_BLANK';
const CLOSE_BLANK = 'CLOSE_BLANK';
const FORWARD_BLANK = 'FORWARD_BLANK';
const UNSPECIFIED_BLANK = 'UNSPECIFIED_BLANK';

const CHECK_OPTION = 'CHECK_OPTION';
const FORWARD_OPTION = 'FORWARD_OPTION';

export function focusBlank(idx, select) {
    return {
        type: FOCUS_BLANK,
        idx,
        select
    }
}

export function forwardBlank(forward) {
    return {
        type: FORWARD_BLANK,
        forward
    }
}

export function closeBlank() {
    return {
        type: CLOSE_BLANK,
    }
}


export function unspecifiedBlank(blanks, select) {
    return {
        type: UNSPECIFIED_BLANK,
        blanks,
        select
    }
}

export function forwardOption(forward) {
    return {
        type: FORWARD_OPTION,
        forward
    }
}

export function checkOption(selectIdx, optionIdx, keypress) {
    console.log(999, keypress);
    return {
        type: CHECK_OPTION,
        selectIdx,
        optionIdx,
        keypress, // 是否从键盘发起的动作
    }
}

//-------------------------------------------------------------------------

const focusBlankReducer = (state = null, action) => {

    if (state.blanks[action.idx] === 0 || // 当前题空处在未选择状态
        state.blanks[action.idx] === -1 //当前题空处在候选状态(多题空题板选择)
    ) { // 设置题空为选择状态
        return setBlankFocusReducer(state, action);

    } else { // 取消题空的选择
        return closeBlankReducer(state, action);
    }
}

const setBlankFocusReducer = (state = null, action) => {
    const blankIdx = action.idx;

    // 设置题空为可答题（活动）状态
    const blanks = Array(state.blanks.length).fill(0);
    const selects = Array(state.selects.length).fill(0);


    const selectIdx = state.blankSelect[blankIdx];

    blanks[blankIdx] = 1;
    selects[selectIdx] = 1;

    return {
        ...state,
        focusOption: null,
        blankIdx: blankIdx,
        selectIdx: selectIdx,
        blanks,
        selects
    };
}

const closeBlankReducer = (state = null, action) => {
    const blanks = Array(state.blanks.length).fill(0);
    const selects = Array(state.selects.length).fill(0);

    return {
        ...state,
        blankIdx: null,
        selectIdx: null,
        focusOption: null,
        blanks,
        selects
    };
}

const forwardBlankReducer = (state = null, action) => {

    let selectedIdx = state.blanks.indexOf(1);
    if (selectedIdx === -1) {
        selectedIdx = 0;
    } else {
        if (action.forward) { // 向前选择
            if (selectedIdx + 1 < state.blanks.length) {
                selectedIdx += 1;
            } else {
                selectedIdx = 0;
            }
        } else { // 向后选择
            if (selectedIdx === 0) {
                selectedIdx = state.blanks.length - 1;
            } else {
                selectedIdx = selectedIdx - 1;
            }
        }
    }

    const selectIdx = state.blankSelect[selectedIdx];

    const blanks = Array(state.blanks.length).fill(0);
    const selects = Array(state.selects.length).fill(0);
    blanks[selectedIdx] = 1;
    selects[selectIdx] = 1;

    return {
        ...state,
        focusOption: null,
        blankIdx: selectedIdx,
        selectIdx: selectIdx,
        blanks,
        selects
    };
}

const unspecifiedBlankReducer = (state = null, action) => {
    const blanks = Array(state.blanks.length).fill(0);
    const selects = Array(state.selects.length).fill(0);

    selects[action.select] = -1;
    action.blanks.forEach(blankIdx => {
        blanks[blankIdx] = -1;
    });

    return {
        ...state,
        blankIdx: null,
        focusOption: null,
        selectIdx: action.select,
        blanks,
        selects
    };
}

const forwardOptionReducer = (state = null, action) => {
    const { focusOption, selectIdx, optionCount } = state;
    const { forward } = action;

    if (focusOption === null) {
        // 如果一开始就从向后方向，则从最后一个开始
        return {
            ...state,
            focusOption: (forward) ? 0 : optionCount[state.selectIdx] - 1
        };
    } else {

        const delta = (forward) ? 1 : -1; // 向前或向后
        const optionCnt = optionCount[selectIdx];

        return {
            ...state,
            focusOption: (optionCnt + focusOption + delta) % optionCnt
        };
    }
};

const checkOptionReducer = (state = null, action) => {
    const { selectIdx, optionIdx, keypress } = action;

    // console.log(666, action, state);
    // console.log(2221, state.focusOption, state.blanks[state.blankIdx]);


    let blankIdx = state.blankIdx;
    if (state.blanks[blankIdx] !== 1 ||
        state.blankSelect[blankIdx] !== selectIdx) {
        // 如果没有可答题的题空，如果选项板只有一个题空，则自动激活题空和选项板，否则跳过

        // 选项板对应的题空
        const selectBlanks = Object.entries(state.blankSelect)
            .filter(([blkIdx, selIdx]) => selIdx === selectIdx)
            .map(([blkIdx, selIdx]) => parseInt(blkIdx, 10));


        // console.log('blanks', selectBlanks);

        if (selectBlanks.length !== 1) {
            return state;
        }

        blankIdx = selectBlanks[0];
        state = setBlankFocusReducer(state, { idx: blankIdx });
    }

    let answer = bisect_toggle(state.answer[blankIdx], optionIdx);
    if (answer.length === 0) {
        answer = null;
    }

    // console.log(2222, optionIdx, state.focusOption, optionIdx === state.focusOption);
    console.log(22333, keypress);


    return {
        ...state,
        focusOption: (keypress) ? optionIdx : null,
        answer: [
            ...state.answer.slice(0, blankIdx),
            answer,
            ...state.answer.slice(blankIdx + 1)
        ]
    };
}


const reducer = (state = null, action) => {
    // -1 代表候选但为确定选择的; 0 没有选择; 1 已选择

    const { type } = action;

    if (type === FOCUS_BLANK) {
        return focusBlankReducer(state, action)

    } else if (type === UNSPECIFIED_BLANK) {
        return unspecifiedBlankReducer(state, action)

    } else if (type === FORWARD_BLANK) {
        return forwardBlankReducer(state, action)

    } else if (type === FORWARD_OPTION) {
        return forwardOptionReducer(state, action)

    } else if (type === CLOSE_BLANK) {
        return closeBlankReducer(state, action);

    } else if (type === CHECK_OPTION) {
        return checkOptionReducer(state, action);
    }

    return state;
};


// const answerReducer = (state = null, action) => {
//     // console.log('answerReducer:', state);
//     const { type } = action;
//     if (type === CHECK_OPTION) {
//         // const { blankIdx, optionIdx } = action;
//     }

//     return state;
// };


// const reducer = combineReducers({
//     active: activeReducer,
//     answer: answerReducer
// });

//---------------------------------------------------------------------------
export function createStore(blankCount, selectCount, blankSelect, optionCount) {
    return _createStore(reducer, {
        optionCount, // 选项板里选项的数量
        blankSelect, // 题空对应的选择板的关系
        // -------------------------------------------
        blankIdx: -1, // 处在可答题的题空索引号
        selectIdx: -1, // 处在可答题的选项板索引号
        focusOption: -1, // 键盘焦点在选项的位置 (selectIdx, focusOption)
        blanks: Array(blankCount).fill(0), // 题空 (-1候选, 0, 1已选)
        selects: Array(selectCount).fill(0), // 选项 (-1候选, 0, 1已选)
        answer: Array(blankCount).fill(null) // 各题空所涂填的答案（可多个选项）
    });
}
