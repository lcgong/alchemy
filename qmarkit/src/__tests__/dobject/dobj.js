/*jshint esversion: 6 */

import dobject from "../../dobject";

let jsobj = {
    a: {
        b: {
            c: 100,
        },
        x: {
            y: 200,
        }
    }
};

test("dobject get/set case1", () => {
    let obj = dobject.fromJS({ a: 123 });

    expect(obj).toBeInstanceOf(dobject.DObject);
    expect(obj.a).toBe(123);
    obj.a = 456;
    expect(obj.a).toBe(456);
});


test("dobject get and set", () => {
    let obj = dobject.fromJS(jsobj = {
        a: {
            b: {
                c: 100,
            },
            x: {
                y: 200,
            }
        }
    });

    expect(obj).toBeInstanceOf(dobject.DObject);
    expect(obj.a).toBeInstanceOf(dobject.DObject);
    expect(obj.a.b).toBeInstanceOf(dobject.DObject);

    expect(obj.a.b.c).toBe(100);

    obj.a.b.c = 101;

    expect(obj.a.b.c).toBe(101);
});
