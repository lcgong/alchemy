/*jshint esversion: 6 */


import dobject, { DList } from "../../dobject";

test("referent dobject", () => {
    let obj;

    // obj = dobject.fromJS({
    //     a: { b: [10, 20] }
    // });
    // console.log(obj);

    // obj.a = null;
    // obj.a = { x: 123 };

    // console.log(obj);

    obj = dobject.fromJS({
        a: { b: [10, 20], c: [30, 40] }
    });

    // console.log("ddd: ", obj.a.b);

    obj.e = obj.a.b;
    console.log('zzz: ', obj.e);

    // expect(obj.e).toBeInstanceOf(DList);
    // console.log(555, obj.e.__object);
    // obj.e[1] += 5;
    // console.log(556, obj.e);

    // obj.e = obj.a.c;
    // obj.e[1] += 5;
    // // console.log(obj.e.__object);
    // console.log(557, obj.e);

    // obj.e.push(200);

    // console.log(555, obj.e);

    // obj.f = obj.e;

    // console.log(obj.e.constructor);
    // expect(obj.e[0]).toBe(10);


    // console.log(obj.e);

    // console.log(obj);

});
