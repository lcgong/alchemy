/*jshint esversion: 6 */

import dobject from "../../dobject";

test("dlist get and set", () => {

    let obj = dobject.fromJS([10, 20, 30]);

    expect(obj[1]).toBe(20);
    expect(obj[9]).toBeUndefined();

    obj[2] = obj[2] + 5;
    expect(obj[2]).toBe(35);
    obj[2] += 3;
    expect(obj[2]).toBe(38);
    obj[2] -= 8;
    expect(obj[2]).toBe(30);
});

test("cache the immutable object of list", () => {
    let obj = dobject.fromJS([10, 20, 30]);

    // expect(obj.__object).toBeUndefined()
    expect(obj[3]).toBeUndefined();
    expect(obj.__object).toBeDefined();

    obj.push(40);
    expect(obj.__object).toBeUndefined(); // clear cache
    expect(obj[3]).toBe(40); // access to get and cache
    expect(obj.__object).toBeDefined();
});

test("push/pop", () => {
    let obj = dobject.fromJS([10, 20, 30]);
    
    expect(obj.push(40, 50)).toBe(obj);
    expect(obj.push(60)).toBe(obj);
    expect(obj[-1]).toBe(60);
    expect(obj[-2]).toBe(50);
    expect(obj[-3]).toBe(40);

    expect(obj.pop()).toBe(obj);
    expect(obj[-1]).toBe(50);
    
    expect(obj.pop()).toBe(obj);
    expect(obj[-1]).toBe(40);
});

test("unshift/shift", () => {
    let obj = dobject.fromJS([10, 20, 30]);
    
    expect(obj.unshift(50, 40)).toBe(obj);
    expect(obj.unshift(60)).toBe(obj);
    expect(obj[0]).toBe(60);
    expect(obj[1]).toBe(50);
    expect(obj[2]).toBe(40);

    expect(obj.shift()).toBe(obj);
    expect(obj[0]).toBe(50);
    
    expect(obj.shift()).toBe(obj);
    expect(obj[0]).toBe(40);
});

test("insert and remove", () => {

    let obj = dobject.fromJS([10, 20, 30, 40, 50]);

    obj.insert(2, 250); // insert the third position
    obj.insert(-2, 350);
    expect(obj[1]).toBe(20);
    expect(obj[2]).toBe(250);
    expect(obj[3]).toBe(30);

    expect(obj[-4]).toBe(30);
    expect(obj[-3]).toBe(350);
    expect(obj[-2]).toBe(40);
    expect(obj[-1]).toBe(50);

    // 
    obj = dobject.fromJS([10, 20, 30, 40, 50]);
    obj.remove(1);
    expect(obj[1]).toBe(30);
    obj.remove(-2);
    expect(obj[-1]).toBe(50);
    expect(obj[2]).toBe(50);

    obj = dobject.fromJS([10, 20, 30, 40, 50]);
    obj.remove(-1);
    expect(obj[3]).toBe(40);
    expect(obj[4]).toBeUndefined();
    obj.remove(0);
    expect(obj[0]).toBe(20);

});

test("iterable", () => {

    let obj;

    obj = dobject.fromJS([10, 20, 30]);
    let data = [];
    for (let i of obj) {
        data.push(i);
    }

    expect(data).toEqual([10, 20, 30]); // deep equality
});
