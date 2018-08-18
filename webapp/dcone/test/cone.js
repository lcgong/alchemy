import {
    Cone,
    isIdenticalIn,
    _getValue,
    setConeIndexedItem,
    deleteConeIndexedItem,
} from "../src/cone";

import { loadNodeFromJS } from "../src/jsobj";

// test("setValue", () => {
//     let cone, cone1, change, cone2;

//     cone1 = new Cone(loadNodeFromJS({ a: { b: { c: 100 }, x:200 } }));
//     cone2 = cone1.branch();

//     change = deleteConeIndexedItem(cone2, '.a.b', 'c');
//     console.log(111, change);
//     console.log(111, JSON.stringify(change.changeset));
//     console.log(111, cone2);

//     change = deleteConeIndexedItem(cone2, '.a', 'b');
//     console.log(222, change);
//     console.log(222, JSON.stringify(change.changeset));
//     console.log(222, cone2);

//     // change = cone2.delete('.a.b');

//     // console.log(111, cone1.getValue('.a.b'));
//     // console.log(111, cone2.getValue('.a.b'));

// });

test("setValue", () => {
    let cone, cone1, change, cone2;

    cone = new Cone(loadNodeFromJS({ a: { b: { c: 100 } } }));
    cone1 = cone.branch();

    change = setConeIndexedItem(cone, '.a.b', 'c', 120);
    expect(_getValue(change.newRoot, '.a.b.c')).toBe(120);
    expect(_getValue(change.oldRoot, '.a.b.c')).toBe(100);
    expect(change.changeset).toEqual([
        ["a", [
            ["b", [
                ["c", { "new": 120, "old": 100 }]
            ]]
        ]]
    ]);

    cone2 = cone.branch();

    expect(cone1.getValue('.a.b.c')).toBe(100);
    expect(cone2.getValue('.a.b.c')).toBe(120);

    expect(cone1.getValue('.a.b').successors[0]).toBe(cone2.getValue('.a.b'));
    expect(cone1.getValue('.a').successors[0]).toBe(cone2.getValue('.a'));
    expect(cone1.getValue('').successors[0]).toBe(cone2.getValue(''));

});

test("delete", () => {
    let cone, change, cone1, cone2, cone3;

    cone = new Cone(loadNodeFromJS({ a: { b: { c: 100 } } }));
    cone1 = cone.branch();

    change = deleteConeIndexedItem(cone, '.a.b', 'c');
    expect(_getValue(change.newRoot, '.a.b.c')).toBeUndefined(); // deleted
    expect(_getValue(change.oldRoot, '.a.b.c')).toBe(100);
    expect(change.changeset).toEqual([
        ["a", [
            ["b", [
                ["c", { "old": 100 }] // for deleting, attr new is undefined
            ]]
        ]]
    ])

    cone2 = cone.branch();

    expect(cone1.getValue('.a.b').successors[0]).toBe(cone2.getValue('.a.b'));
    expect(cone1.getValue('.a').successors[0]).toBe(cone2.getValue('.a'));
    expect(cone1.getValue('').successors[0]).toBe(cone2.getValue(''));

    change = deleteConeIndexedItem(cone, '.a', 'b');
    expect(cone.getValue('.a.b')).toBeUndefined()

    cone3 = cone.branch();

    change = deleteConeIndexedItem(cone, '.a', 'b');
    expect(change.changeset.length).toBe(0);

    expect(cone3.getValue('.a.b')).toBeUndefined();

    expect(cone2.getValue('.a').successors[0]).toBe(cone3.getValue('.a'));
    expect(cone2.getValue('.a.b').successors).toEqual([]);

});

test("cone fromJS", () => {
    let root1, root2, root3;
    let node;

    root1 = loadNodeFromJS({
        a: {
            b: { c: 100 },
            x: { y: 200 }
        }
    });

    let cone1, cone2, cone3;
    let change;

    cone1 = new Cone(root1);


    expect(cone1.getValue('')).toBe(root1);
    expect(cone1.getValue('.a.b.c')).toBe(100);

    node = cone1.getValue('.a.b')

    let root;

    root = cone1.root;
    expect(isIdenticalIn(root, '.a.b', root, '.a.b')).toBeTruthy();
    expect(isIdenticalIn(root, '.a.b', root, '.a')).toBeTruthy();
    expect(isIdenticalIn(root, '.a.b', root, '')).toBeTruthy();


    // -----------------------------------------------------------------------
    cone2 = cone1.branch();

    // 设置相同的值或对象，不应该发生变化
    change = setConeIndexedItem(cone2, '.a.b', 'c', 100);
    expect(change.newRoot).toBeUndefined(); // no change
    expect(change.changeset.length).toBe(0); // no change

    expect(cone2.root).toBe(cone1.root); // the root of cone is not modified.

    // ----------------------------------------------------------------------
    cone3 = cone1.branch();

    change = setConeIndexedItem(cone3, '.a.b', 'c', 120);

    expect(change).not.toBeUndefined();
    expect(cone3.root).not.toBe(cone1.root); // it's new root because of the changged

    root = cone1.root;
    expect(isIdenticalIn(cone3.root, '.a.b', cone1.root, '.a.b')).toBeFalsy();
    expect(isIdenticalIn(cone3.root, '.a.b', cone1.root, '.a')).toBeFalsy();
    expect(isIdenticalIn(cone3.root, '.a.b', cone1.root, '')).toBeFalsy();


    // 尽管b发生了变化，但x没有
    node = cone3.getValue('.a.x');

    expect(isIdenticalIn(cone3.root, '.a.x', cone1.root, '.a.x')).toBeTruthy();
    expect(isIdenticalIn(cone3.root, '.a.x', cone1.root, '.a')).toBeTruthy();
    expect(isIdenticalIn(cone3.root, '.a.x', cone1.root, '')).toBeTruthy();
});


test("changed event", (done) => { // 使用jest的异步测试，利用jest的done参数告知

    let cone = new Cone(loadNodeFromJS({ a: { b: { c: 100 } } }));

    let cone1 = cone.branch(); // 

    let subscription = cone.subject('.a.b').subscribe((chg) => {
        try {
            expect(cone.root).not.toBe(cone1.root);

            expect(chg.path).toBe('.a.b');

            expect(_getValue(chg.newRoot, '.a.b.c')).toBe(120);
            expect(_getValue(chg.oldRoot, '.a.b.c')).toBe(100);


            subscription.unsubscribe();
        } catch (e) { // 捕捉expect的异常，并通过done对象告知jest
            done.fail(e);
        }
        done(); // jest: asynchronous testing
    });

    // 发生变更，会触发变更事件
    let change = setConeIndexedItem(cone, '.a.b', 'c', 120);

    cone.emitChangeEvent(change);

    setTimeout(() => { done.fail('no change event'); }, 500);
});

test("changed event", (done) => { // 使用jest的异步测试，利用jest的done参数告知

    let cone = new Cone(loadNodeFromJS({ a: { b: { c: 100 } } }));

    let cone1 = cone.branch(); // 

    let subscription = cone.subject().subscribe((chg) => {
        try {
            expect(cone.root).not.toBe(cone1.root);

            expect(chg.path).toBe('');

            expect(_getValue(chg.newRoot, '.a.b.c')).toBe(120);
            expect(_getValue(chg.oldRoot, '.a.b.c')).toBe(100);

            subscription.unsubscribe();
        } catch (e) { // 捕捉expect的异常，并通过done对象告知jest
            done.fail(e);
        }
        done(); // jest: asynchronous testing
    });

    let change = setConeIndexedItem(cone, '.a.b', 'c', 120);
    cone.emitChangeEvent(change);

    setTimeout(() => { done.fail('no change event'); }, 500);
});

test("delete event", (done) => { // 使用jest的异步测试，利用jest的done参数告知

    let cone = new Cone(loadNodeFromJS({ a: { b: { c: 100 } } }));

    let cone1 = cone.branch(); // 

    let subscription = cone.subject().subscribe((chg) => {
        try {
            expect(cone.root).not.toBe(cone1.root);
            // console.log(1111, chg);

            expect(cone.root).not.toBe(cone1.root);

            expect(chg.path).toBe('');

            expect(_getValue(chg.newRoot, '.a.b')).toBeUndefined();
            expect(_getValue(chg.oldRoot, '.a.b')).not.toBeUndefined();

            subscription.unsubscribe();
        } catch (e) { // 捕捉expect的异常，并通过done对象告知jest
            done.fail(e);
        }
        done(); // jest: asynchronous testing
    });

    let change = deleteConeIndexedItem(cone, '.a', 'b');
    cone.emitChangeEvent(change);

    setTimeout(() => { done.fail('no change event'); }, 500);
});


