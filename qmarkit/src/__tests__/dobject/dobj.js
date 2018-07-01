/*jshint esversion: 6 */

import dobject from "../../dobject";


test("dobject get/set case1", () => {
    let obj = dobject.fromJS({ a: 123 });

    expect(obj).toBeInstanceOf(dobject.DObject);
    expect(obj.a).toBe(123);
    obj.a = 456;
    expect(obj.a).toBe(456);
});


test("dobject delete", () => {
    let obj = dobject.fromJS({ a: 123, b: 456 });

    expect(obj.b).toBe(456);
    expect([...dobject.keys(obj)]).toEqual(['a', 'b']);

    delete obj.b;

    expect(obj.b).toBeUndefined();
    expect([...dobject.keys(obj)]).toEqual(['a']);
});


test("dobject get and set", () => {
    let obj = dobject.fromJS({
        a: {
            b: {
                c: 100,
            },
            x: {
                y: 200,
            }
        }
    });

    console.log(obj.toString());

    expect(obj).toBeInstanceOf(dobject.DObject);
    expect(obj.a).toBeInstanceOf(dobject.DObject);
    expect(obj.a.b).toBeInstanceOf(dobject.DObject);
    expect(obj.a.b.c).toBe(100);


    expect(obj.a.b.__parent).toBe(obj.a);
    expect(obj.a.__parent).toBe(obj);

    expect(obj.a.__index).toBe('a');
    expect(obj.a.b.__index).toBe('b');


    obj.a.b.c = 101;

    expect(obj.a.b.c).toBe(101);
});
