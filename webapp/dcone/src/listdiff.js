// https://blog.mgechev.com/2017/11/14/angular-iterablediffer-keyvaluediffer-custom-differ-track-by-fn-performance/
// https://github.com/cubicdaiya/onp


// 在list比较元素时，存在仅仅是交换位置，并没有修改内容，因此，引入intact属性，为true时，表示没有修改


function listDiff(newlst, oldlst) {

    const mapnew = new Map();
    const newListSize = newlst.size;
    const oldListSize = oldlst.size;

    // 建立一个位置速查表，根据值对象，查找在新列表的索引位置。存在重复数据，因此，位置会多个
    for (let i = newListSize - 1; i >= 0; i--) {
        let obj = newlst.get(i);
        let idxs = mapnew.get(obj);
        if (idxs === undefined) {
            mapnew.set(obj, [i]);
        } else {
            idxs.push(i);
        }
    }

    const oldObjSet = new Set();

    // 找出删除的项目
    let delitems = new Map();
    for (let i = 0, n = oldlst.size; i < n; i++) {
        let obj = oldlst.get(i);

        if (obj !== undefined) { // 登记旧版本里的对象
            oldObjSet.add(obj);
        }

        let idxs = mapnew.get(obj);
        if (idxs === undefined) {
            delitems.set(i, obj);
        } else {
            // 在旧表中找到，因此减少一个标志，可能存在多个值，依次删除
            // 如果提前删完，说明重复的有一个删除，目前无法判断是那个，
            // 因此，默认将删除的是末端位置删除
            idxs.pop();
            if (idxs.length == 0) {
                mapnew.delete(obj);
            }
        }
    }

    // 找出新增项目
    let newitems = new Map();
    for (let [obj, idxs] of mapnew.entries()) {
        for (let i of idxs) {
            newitems.set(i, obj);
        }
    }

    // 合并同位置的即删又增的作为更新，因此过略掉
    if (newitems.size < delitems.size) {
        for (let [idx, newObj] of newitems.entries()) {
            let oldObj = delitems.get(idx);
            if (oldObj !== undefined) {
                newitems.delete(idx);
                delitems.delete(idx);
            }
        }
    } else {
        for (let [idx, oldObj] of delitems.entries()) {
            let newObj = newitems.get(idx);
            if (newObj !== undefined) {
                newitems.delete(idx);
                delitems.delete(idx);

            }
        }
    }

    const changeset = [];


    for (let idx of [...delitems.keys()].sort()) {
        const oldObj = delitems.get(idx);
        changeset.push([idx, { old: oldObj }]);
    }

    for (let idx of [...newitems.keys()].sort()) {
        const newObj = newitems.get(idx);
        changeset.push([idx, { new: newObj }]);
    }

    // 排除删除和新增的，对其新旧列表（大小应该一样），比较差异
    let newIdx = 0,
        oldIdx = 0;
    while (true) {
        if (newitems.has(newIdx)) {
            newIdx += 1;
            continue;
        }

        if (delitems.has(oldIdx)) {
            oldIdx += 1;
            continue;
        }

        if (newIdx >= newListSize || oldIdx >= oldListSize) {
            break;
        }

        let newObj = newlst.get(newIdx);
        let oldObj = oldlst.get(oldIdx);
        if (newObj !== oldObj) {
            if (oldObjSet.has(newObj)) {
                changeset.push([oldIdx, {
                    new: newObj,
                    old: oldObj,
                    intact: true
                }]);
            } else {
                changeset.push([oldIdx, {
                    new: newObj,
                    old: oldObj
                }]);
            }

        }


        newIdx += 1;
        oldIdx += 1;
    }

    return changeset;
}


export {
    listDiff
};
