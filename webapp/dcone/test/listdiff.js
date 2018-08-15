import Immutable from "immutable/dist/immutable";
import { listDiff } from "../src/listdiff";

function swapListItem(list, idx0, idx1) {
    if (idx0 === idx1) {
        return list;
    }

    console.assert(idx0 < list.size && idx1 < list.size);

    let val0 = list.get(idx0);
    let val1 = list.get(idx1);

    return list.set(idx0, val1).set(idx1, val0);
}

test("diff a list", () => {

    let changeset;
    let newlst, oldlst;

    // 没有发生变更，返回空集
    oldlst = Immutable.List([10, 20, 30, 40, 50]);
    changeset = listDiff(oldlst, oldlst);
    expect(changeset.length).toBe(0);

    // 直接改变某个位置的值
    oldlst = Immutable.List([10, 20, 30, 50]);
    newlst = oldlst.set(2, 40); // 第2位置发生变化
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([2, { 'new': 40, 'old': 30 }]);

    // 插入
    oldlst = Immutable.List([20, 30, 40, 50]);
    newlst = oldlst.unshift(10); // delete the first
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([0, { new: 10 }]);

    oldlst = Immutable.List([10, 20, 30, 40]);
    newlst = oldlst.push(50); // delete the first
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([4, { new: 50 }]);

    oldlst = Immutable.List([10, 20, 40, 50]);
    newlst = oldlst.insert(2, 30); // delete the first
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([2, { new: 30 }]);

    // 删除
    oldlst = Immutable.List([10, 20, 30, 40, 50]);
    newlst = oldlst.shift(); // delete the first
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([0, { old: 10 }]);

    oldlst = Immutable.List([10, 20, 30, 40, 50]);
    newlst = oldlst.delete(3);
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([3, { old: 40 }]);

    oldlst = Immutable.List([10, 20, 30, 40, 50]);
    newlst = oldlst.pop(); // delete the last one
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(1);
    expect(changeset[0]).toEqual([4, { old: 50 }]);

    // 交换位置的变更
    oldlst = Immutable.List([10, 20, 30, 40, 50]);
    newlst = swapListItem(oldlst, 1, 3); // 交换1和3位置的内容
    changeset = listDiff(newlst, oldlst);
    expect(changeset.length).toBe(2);
    expect(changeset[0]).toEqual([1, { new: 40, old: 20 }]);
    expect(changeset[1]).toEqual([3, { new: 20, old: 40 }]);

});

test("diff a list", () => {

    let changeset;
    let newlst, oldlst;

    newlst = Immutable.List([10, 20, 30, 40, 20, 30]);
    oldlst = Immutable.List([10, 30, 40, 50, 30, 50]);
    changeset = listDiff(newlst, oldlst);
    // console.log(changeset);

    expect(changeset.length).toBe(4);
    expect(changeset[0]).toEqual([3, { old: 50 }]);
    expect(changeset[1]).toEqual([5, { old: 50 }]);
    expect(changeset[2]).toEqual([1, { new: 20 }]);
    expect(changeset[3]).toEqual([4, { new: 20 }]);
});


test("BAD CASE: shifting circularly", () => {

    let changeset;
    let newlst, oldlst;

    // 将队首的元素移动到最后，导致坐标集体发生更替
    oldlst = Immutable.List([10, 20, 30, 40, 50]);
    newlst = oldlst.shift(); // delete the first, 10
    newlst = newlst.push(10); // push the last again

    changeset = listDiff(newlst, oldlst);

    expect(changeset.length).toBe(5);
    expect(changeset[0]).toEqual([0, { new: 20, old: 10 }]);
    expect(changeset[1]).toEqual([1, { new: 30, old: 20 }]);
    expect(changeset[2]).toEqual([2, { new: 40, old: 30 }]);
    expect(changeset[3]).toEqual([3, { new: 50, old: 40 }]);
    expect(changeset[4]).toEqual([4, { new: 10, old: 50 }]);
});

test("BAD CASE: delete a duplicate value", () => {

    let changeset;
    let newlst, oldlst;


    oldlst = Immutable.List([10, 88, 20, 88, 30, 88, 40]);
    newlst = oldlst.delete(1);
    changeset = listDiff(newlst, oldlst);

    // 88有三个重复值，删除的是第1个，目前没办法判断删除的是那个位置，
    // 因此默认最后一个，导致部分向前移动位置
    expect(changeset.length).toBe(5);
    expect(changeset[0]).toEqual([5, { 'old': 88 }]);
    expect(changeset[1]).toEqual([1, { 'new': 20, 'old': 88 }]);
    expect(changeset[2]).toEqual([2, { 'new': 88, 'old': 20 }]);
    expect(changeset[3]).toEqual([3, { 'new': 30, 'old': 88 }]);
    expect(changeset[4]).toEqual([4, { 'new': 88, 'old': 30 }]);
});
