import {
    Cone,
    getValueInNode,
    setValueInCone
} from "../src/cone";
import { buildNodeFromJS } from "../src/fromjs";


import { catchError } from 'rxjs/operators';

test("cone fromJS", () => {
    let root1, root2, root3;
    let node;

    root1 = buildNodeFromJS({
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
    expect(node.isIdenticalIn(cone1.getValue('.a.b'))).toBeTruthy();
    expect(node.isIdenticalIn(cone1.getValue('.a'))).toBeTruthy();
    expect(node.isIdenticalIn(cone1.getValue(''))).toBeTruthy();

    // -----------------------------------------------------------------------
    cone2 = cone1.branch();

    change = cone2.setValue('.a.b.c', 100); // 设置相同的值或对象，不应该发生变化
    expect(change).toBeUndefined();

    expect(cone2.root).toBe(cone1.root); // the root of cone is not modified.

    // ----------------------------------------------------------------------
    cone3 = cone1.branch();

    change = cone3.setValue('.a.b.c', 120);
    expect(change).not.toBeUndefined();
    expect(cone3.root).not.toBe(cone1.root); // it's new root because of the changged

    node = cone3.getValue('.a.b');
    expect(node.isIdenticalIn(cone1.getValue('.a.b'))).toBeFalsy();
    expect(node.isIdenticalIn(cone1.getValue('.a'))).toBeFalsy();
    expect(node.isIdenticalIn(cone1.getValue(''))).toBeFalsy();

    // 尽管b发生了变化，但x没有
    node = cone3.getValue('.a.x');
    expect(node.isIdenticalIn(cone1.getValue('.a.x'))).toBeTruthy();
    expect(node.isIdenticalIn(cone1.getValue('.a'))).toBeTruthy();
    expect(node.isIdenticalIn(cone1.getValue(''))).toBeTruthy();

});


test("changed event", (done) => { // 使用jest的异步测试，利用jest的done参数告知

    let cone = new Cone(buildNodeFromJS({ a: { b: { c: 100 } } }));

    let cone1 = cone.branch(); // 

    let subscription = cone.subject('.a.b').subscribe((chg) => {
        try {
            expect(cone.root).not.toBe(cone1.root);

            expect(chg.node.isIdenticalIn(cone.getValue('.a.b'))).toBeTruthy();
            expect(chg.node.isIdenticalIn(cone1.getValue('.a.b'))).toBeFalsy();

            expect(cone.getValue('.a.b.c')).toBe(120);
            expect(cone1.getValue('.a.b.c')).toBe(100);

            subscription.unsubscribe();
        } catch (e) { // 捕捉expect的异常，并通过done对象告知jest
            done.fail(e);
        }
        done(); // jest: asynchronous testing
    });

    let change = cone.setValue('.a.b.c', 120); // 发生变更，会触发变更事件
    cone.emitChangeEvent(change);

    setTimeout(() => { done.fail('no change event'); }, 500);
});

test("changed event", (done) => { // 使用jest的异步测试，利用jest的done参数告知

    let cone = new Cone(buildNodeFromJS({ a: { b: { c: 100 } } }));

    let cone1 = cone.branch(); // 

    let subscription = cone.subject().subscribe((chg) => {
        try {
            expect(chg.node.obpath).toBe('.a.b');

            expect(cone.root).not.toBe(cone1.root);

            expect(chg.node.isIdenticalIn(cone.getValue('.a.b'))).toBeTruthy();
            expect(chg.node.isIdenticalIn(cone1.getValue('.a.b'))).toBeFalsy();

            expect(cone.getValue('.a.b.c')).toBe(120);
            expect(cone1.getValue('.a.b.c')).toBe(100);

            subscription.unsubscribe();
        } catch (e) { // 捕捉expect的异常，并通过done对象告知jest
            done.fail(e);
        }
        done(); // jest: asynchronous testing
    });

    let change = cone.setValue('.a.b.c', 120); // 发生变更，会触发变更事件
    cone.emitChangeEvent(change);

    setTimeout(() => { done.fail('no change event'); }, 500);
});

