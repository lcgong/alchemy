import dcone from "../src";
import D from "../src";

import { exportNodetoJS } from "../src/jsobj";


test("dobject", () => {
    let dobj1, dobj2;;

    dobj1 = D.fromJS({ a: { b: { c: 100, d: ['x', 'y'] } } });

    expect(dobj1.a.b.__stub.path).toBe('.a.b');
    expect(dobj1.a.b.c).toBe(100);

    dobj2 = D.branch(dobj1);

    expect(dobj2.__stub.cone).not.toBe(dobj1.__stub.cone);
    expect(dobj2.__stub.root).toBe(dobj1.__stub.root);

    dobj2.a.b.c = 110;
    // 只要操作，会自动更新stub.root与cone.root一致
    expect(dobj2.__stub.root).toBe(dobj2.__stub.cone.root);
    expect(dobj2.a.__stub.root).toBe(dobj2.__stub.cone.root);
    expect(dobj2.a.b.__stub.root).toBe(dobj2.__stub.cone.root);
    expect(dobj2.a.b.c).toBe(110);

    dobj2.a.b.c = 150;
    expect(dobj2.a.b.c).toBe(150);

    expect(dobj1.a.b.c).toBe(100); // 最早的值

    let node; // 根据节点的successors的追溯变更历史
    node = dobj1.a.b.__stub.node;
    expect(node.object.get('c')).toBe(100);

    node = node.successors[0];
    expect(node.object.get('c')).toBe(110);

    node = node.successors[0];
    expect(node.object.get('c')).toBe(150);

});

test("dobject", () => {

    let dobj1, dobj2;

    dobj1 = D.fromJS({
        a: { x: 100 },
        b: { x: 110 },
    });

    dobj2 = D.branch(dobj1);

    expect(dobj2.a.x).not.toBeUndefined();
    delete dobj2.a.x;
    expect(dobj2.a.x).toBeUndefined();

    expect(dobj2.b.x).not.toBeUndefined();
    delete dobj2.b.x;
    expect(dobj2.b.x).toBeUndefined();

    expect(dobj2.b).not.toBeUndefined();
    delete dobj2.b;
    expect(dobj2.b).toBeUndefined();

    expect(D.toJS(dobj2)).toEqual({ a: {} });


    let node; // 根据节点的successors的追溯变更历史
    node = dobj1.b.__stub.node;
    expect(exportNodetoJS(node)).toEqual({ x: 110 });

    node = node.successors[0];
    expect(exportNodetoJS(node)).toEqual({});
    expect(node.successors).toEqual([]); // 后面的b删除了，因此后继是空
});

test("keys and size of dobject", () => {
    let dobj1;

    dobj1 = D.fromJS({ a: 1, b: 2 });
    expect([...D.keys(dobj1)]).toEqual(['a', 'b']);
    expect(D.size(dobj1)).toBe(2);

    delete dobj1.b;
    expect([...D.keys(dobj1)]).toEqual(['a']);
    expect(D.size(dobj1)).toBe(1);

    dobj1 = D.fromJS([10, 20, 30, 40]);
    expect([...D.keys(dobj1)]).toEqual([0, 1, 2, 3]);
    expect(D.size(dobj1)).toBe(4);
});
