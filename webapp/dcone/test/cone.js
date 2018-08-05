import {
    Cone,
    getValueInNode,
    setValueInCone
} from "../src/cone";
import { buildNodeFromJS } from "../src/fromjs";

test("cone fromJS", () => {
    let root1, root2, root3;
    let node;

    root1 = buildNodeFromJS({
        a: {
            b: { c: 100 },
            x: { y: 200 }
        }
    });

    expect(getValueInNode(root1, '')).toBe(root1);
    expect(getValueInNode(root1, '.a.b.c')).toBe(100);

    node = getValueInNode(root1, '.a.b')
    expect(node.isIdenticalIn(getValueInNode(root1, '.a.b'))).toBeTruthy();
    expect(node.isIdenticalIn(getValueInNode(root1, '.a'))).toBeTruthy();
    expect(node.isIdenticalIn(getValueInNode(root1, ''))).toBeTruthy();


    let cone = new Cone(root1);

    setValueInCone(cone, '.a.b.c', 100); // 设置相同的值或对象，不应该发生变化
    expect(cone.root).toBe(root1); // the root of cone is not modified.

    setValueInCone(cone, '.a.b.c', 120);
    expect(cone.root).not.toBe(root1); // it's new root because of the changged

    root2 = cone.root;

    node = getValueInNode(root2, '.a.b');
    expect(node.isIdenticalIn(getValueInNode(root1, '.a.b'))).toBeFalsy();
    expect(node.isIdenticalIn(getValueInNode(root1, '.a'))).toBeFalsy();
    expect(node.isIdenticalIn(getValueInNode(root1, ''))).toBeFalsy();

    // 尽管b发生了变化，但x没有
    node = getValueInNode(root2, '.a.x');
    expect(node.isIdenticalIn(getValueInNode(root1, '.a.x'))).toBeTruthy();
    expect(node.isIdenticalIn(getValueInNode(root1, '.a'))).toBeTruthy();
    expect(node.isIdenticalIn(getValueInNode(root1, ''))).toBeTruthy();

});


test("changed event", (done) => { // 使用jest的异步测试，利用jest的done参数告知

    let root1, cone;

    root1 = buildNodeFromJS({ a: { b: { c: 100 } } });

    cone = new Cone(root1);
    
    let subscription = cone.getChangedSubject('.a.b').subscribe((newnode) => {

        expect(cone.root).not.toBe(root1);

        const root2 = cone.root;
        
        expect(newnode.isIdenticalIn(getValueInNode(root1, '.a.b'))).toBeFalsy();
        expect(newnode.isIdenticalIn(getValueInNode(root2, '.a.b'))).toBeTruthy();

        expect(getValueInNode(newnode, '.c')).toBe(120);

        subscription.unsubscribe();
        
        done(); // jest: asynchronous testing

    });

    setValueInCone(cone, '.a.b.c', 120); // 发生变更，会触发变更事件

});

test("changed event", (done) => {

    let cone;
    
    cone = new Cone(buildNodeFromJS({ a: { b: { c: 100 } } }));


    let subject = cone.getChangedSubject('.a.b');
    
    let subscription = subject.subscribe((newnode) => {
        done.fail();
    });

    setValueInCone(cone, '.a.b.c', 100); // 值没有改变，不会触发时间

    setTimeout(() => { done(); }, 500);
});