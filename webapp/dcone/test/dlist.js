/*jshint esversion: 6 */


import D from "../src";


test("dlist get and set", () => {

    let obj = D.fromJS([10, 20, 30]);

    expect(obj[1]).toBe(20);
    expect(obj[9]).toBeUndefined(); // outside of list's size

    expect(obj.first).toBe(10);
    expect(obj.last).toBe(30);

    obj[2] = obj[2] + 5;
    expect(obj[2]).toBe(35);

    obj[2] += 3;
    expect(obj[2]).toBe(38);

    obj[2] -= 8;
    expect(obj[2]).toBe(30);
});

test("dlist of dobject", () => {

    let obj = D.fromJS([{ a: 123 }, { a: 456 }, 789]);

    expect(D.isObject(obj[0])).toBeTruthy();
    expect(D.isObject(obj[1])).toBeTruthy();
    expect(D.isObject(obj[2])).toBeFalsy();

    expect(obj[0].a).toBe(123);
    expect(obj[1].a).toBe(456);

    expect(obj[2]).toBe(789);

    obj = D.fromJS({ a: 123, b: [{ a: 456 }, 789] });

    expect(D.isList(obj.b)).toBeTruthy();
    expect(D.isObject(obj.b[0])).toBeTruthy();
    expect(obj.b[0].a).toBe(456);
    expect(obj.b[1]).toBe(789);

});

test("iterator of dlist ", () => {

    let obj = D.fromJS([10, 20, 30]);

    expect([...obj]).toEqual([10, 20, 30]);
});


test("push/pop", () => {
    let obj = D.fromJS([10, 20, 30]);

    expect(obj.push(40, 50)).toBe(obj);
    expect([...obj]).toEqual([10, 20, 30, 40, 50]);

    expect(obj.push(60)).toBe(obj);
    expect([...obj]).toEqual([10, 20, 30, 40, 50, 60]);

    expect(obj.pop()).toBe(obj);
    expect([...obj]).toEqual([10, 20, 30, 40, 50]);

    expect(obj.pop()).toBe(obj);
    expect([...obj]).toEqual([10, 20, 30, 40]);
});

test("unshift/shift", () => {
    let obj = D.fromJS([10, 20, 30]);

    expect(obj.unshift(40, 50)).toBe(obj);
    expect([...obj]).toEqual([40, 50, 10, 20, 30]);

    expect(obj.unshift(60)).toBe(obj);
    expect([...obj]).toEqual([60, 40, 50, 10, 20, 30]);

    expect(obj.shift()).toBe(obj);
    expect([...obj]).toEqual([40, 50, 10, 20, 30]);

    expect(obj.shift()).toBe(obj);
    expect([...obj]).toEqual([50, 10, 20, 30]);
});

test("dlist's insert", () => {

    let obj = D.fromJS([10, 20, 30]);

    obj.insert(2, 200);
    expect([...obj]).toEqual([10, 20, 200, 30]);

    obj.insert(0, 5);
    expect([...obj]).toEqual([5, 10, 20, 200, 30]);


    obj.insert(obj.size, 300);
    expect([...obj]).toEqual([5, 10, 20, 200, 30, 300]);

    obj.insert(99, 900); // Because the index is outsize of the size
    console.log([...obj]);
    expect([...obj]).toEqual([5, 10, 20, 200, 30, 300, 900]);

});

test("dlist's remove", () => {

    let obj = D.fromJS([10, 20, 30, 40, 50]);
    obj.remove(1);
    expect([...obj]).toEqual([10, 30, 40, 50]);

    obj.remove(0);
    expect([...obj]).toEqual([30, 40, 50]);

    obj.remove(obj.size - 1);
    expect([...obj]).toEqual([30, 40]);

    obj.remove(obj.size);
    expect([...obj]).toEqual([30, 40]);

    obj.remove(99);
    expect([...obj]).toEqual([30, 40]);
});
