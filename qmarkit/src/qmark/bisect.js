//

function bisect_left(array, x) {
    let start = 0;
    let end = array.length;

    while (start < end) {
        const mid = (start + end) >> 1;
        if (array[mid] < x) {
            start = mid + 1;
        } else {
            end = mid;
        }
    }

    return start;
}

// function insort_left(array, x) {
//     let idx = bisect_left(array, x);
//     array.splice(idx, 0, x);
//     return idx;
// }

export function bisect_exists(array, x) {
    if (!array) {
        return false;
    }
        
    const idx = bisect_left(array, x);
    return array[idx] === x;
}

export function bisect_toggle(array, x) {
    if (!array) {
        array = [];
    }
    
    // 如果x不存在，则按照从小到大插入，如果已经存在则删除
    const idx = bisect_left(array, x);
    if (array[idx] === x) {

        return [...array.slice(0, idx), ...array.slice(idx + 1)]
    } else {

        return [...array.slice(0, idx), x, ...array.slice(idx)]
    }
}
