import { DObjectNode, DListNode } from "./cone";
import { NOT_SET_VALUE } from "./utils";
import { listDiff } from "./listdiff";


// changeset:
// [index, [[index, {new, old}], [index, ...]]]
// let a = {
//     old: null, //
//     new: null //   new 
// }

// new: old == undefined & new != undefined
// UPD: old != undefined & new != undefined
// DEL: old != undefined & new == undefined
// index == null 代表对象自己


function diff(newNode, oldNode) {

    if (newNode === oldNode) {
        // console.log('same',  newNode);
        return; // no changes
    }

    if (newNode instanceof DObjectNode) {
        if (oldNode instanceof DObjectNode) {
            return diffDObjectNodes(newNode, oldNode, diff);
        }

        // 前后类型不一致，直接判定发生变更
        return { 'new': newNode, 'old': oldNode };

    } else if (newNode instanceof DListNode) {

        if (oldNode instanceof DListNode) {
            return diffDListNodes(newNode, oldNode, diff);
        }

        // 前后类型不一致，直接判定发生变更
        return { 'new': newNode, 'old': oldNode };

    } else { // new and old values
        if (newNode != oldNode) {
            return { 'new': newNode, 'old': oldNode };
        }
    }

    return [];
}

function _diffPropertyNames(newNode, oldNode) {
    let newIdxs = new Set([...oldNode.object.keys()]);
    let oldIdxs = new Set([...newNode.object.keys()]);

    let added = new Set();
    let chked = new Set();
    let deled = new Set();
    for (let idx of oldIdxs) {
        if (newIdxs.has(idx)) {
            chked.add(idx);
        } else {
            added.add(idx);
        }
    }

    for (let idx of newIdxs) {
        if (!(chked.has(idx))) {
            deled.add(idx);
        }
    }

    return [added, chked, deled];
}

function diffDObjectNodes(newNode, oldNode, diffFn) {
    let [added, chked, deled] = _diffPropertyNames(newNode, oldNode);

    let changeset = [];

    for (let name of added) { // 新增的属性
        changeset.push([name, {
            'new': newNode.object.get(name)
        }]);
    }

    for (let name of chked) { // 变更的属性
        let chgs;
        chgs = diffFn(newNode.object.get(name), oldNode.object.get(name));
        if (chgs !== undefined) {
            changeset.push([name, chgs]);
        }
    }

    for (let name of deled) { // 删除的属性
        changeset.push([name, {
            'old': oldNode.object.get(name)
        }]);
    }

    if (changeset.length > 0) {
        return changeset;
    }
}

function diffDListNodes(newNode, oldNode, diffFn) {
    console.assert(newNode instanceof DListNode);
    console.assert(oldNode instanceof DListNode);

    let newList = newNode.object;
    let oldList = oldNode.object;

    let changeset = listDiff(newList, oldList);

    for (let chg of changeset) {
        let idx = chg[0];
        let delta = chg[1];
        if (delta.new !== undefined && delta.old !== undefined) {
            if (delta.intact !== true) {
                let chgs;
                chgs = diffFn(newNode.object.get(idx), oldNode.object.get(idx));
                if (chgs !== undefined) {
                    chg[1] = chgs;
                    // changeset.push();
                }
            }
        }
    }

    if (changeset.length > 0) {
        return changeset;
    }
}




function _patch(changeset, tgtNode, origNode) {


    let tgtObj = tgtNode.object;
    for (let [idx, chg] of changeset) {

        if (Array.isArray(chg)) {
            console.log(111,idx,  chg);

            const tgtChildNode = tgtNode.object.get(idx);
            const orginChildNode = origNode.object.get(idx);

            const valueNode = _patch(chg, tgtChildNode, orginChildNode);
            if (valueNode !== undefined) { // 属性值的新节点
                tgtObj = tgtObj.set(idx, valueNode);
            }
            
        } else {
            if (chg.new != undefined) {
                if (chg.old != undefined) {
                    // 更新属性
                    tgtObj = tgtObj.set(idx, chg.new);
                } else {
                    // 新增属性
                    tgtObj = tgtObj.set(idx, chg.new);
                }
            } else {
                // chg.new == undefined
                if (chg.old != undefined) {
                    // 删除属性
                    tgtObj = tgtObj.delete(idx);
                }
            }
        }
    }

    if (tgtObj === tgtNode.object) {
        return; // 对象未发生变化，还是同一个对象，节点保持原来的
    }

    // 对象的值已经发生改变
    let newNode = new tgtNode.constructor(tgtObj);
    newNode.succeed(tgtNode);

    return newNode;
}

function merge(tgtCone, tgtPath, origCone, srcCone, srcPath) {
    let tgtNode = tgtCone.getValue(tgtPath);
    let srcNode = srcCone.getValue(srcPath);
    let origNode = origCone.getValue(srcPath);

    const changeset = diff(srcNode, origNode);

    tgtCone.root = _patch(changeset, tgtNode, origNode);

    return changeset;
}


export {
    merge,
    diff
};
