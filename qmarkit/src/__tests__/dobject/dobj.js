/*jshint esversion: 6 */

import dobject from "../../dobject";

test("dobject fromJS", () => {
    let obj;

    obj = dobject.fromJS({ a: { b: { c: 100 } } });

    expect(obj).toBeInstanceOf(dobject.DObject);
    expect(obj.a).toBeInstanceOf(dobject.DObject);
    expect(obj.a.b).toBeInstanceOf(dobject.DObject);
    expect(obj.a.b.c).toEqual(100);

    expect(obj.a.__path).toEqual(['a']);
    expect(obj.a.b.__path).toEqual(['a', 'b']);

    let current;

    current = obj.__cone.root.__object;
    expect(obj.__object).toBe(current);

    current = current.get('a').__object;
    expect(obj.a.__object).toBe(current);

    current = current.get('b').__object;
    expect(obj.a.b.__object).toBe(current);
    // console.log(current);
});


test("dobject set", () => {
    let obj;

    obj = dobject.fromJS({ a: 1 });
    expect(obj.a).toBe(1);
    obj.a = 10;
    expect(obj.a).toBe(10);


    obj = dobject.fromJS({
        a: {
            b: {
                c: {
                    d: 1,
                    m: 100
                },
                z: 10
            },
            y: 20
        },
        x: 30
    });
    expect(obj.a.b.c.d).toBe(1);
    obj.a.b.c.d = 10;
    expect(obj.a.b.c.d).toBe(10);
    // console.log(obj);
});


test("dobject delete", () => {
    let obj = dobject.fromJS({ a: 123, b: 456 });

    expect(obj.b).toBe(456);
    expect([...dobject.keys(obj)]).toEqual(['a', 'b']);

    delete obj.b;
    expect(obj.b).toBeUndefined();

    expect(obj.b).toBeUndefined();
    expect([...dobject.keys(obj)]).toEqual(['a']);
});

