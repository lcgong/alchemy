/*jshint esversion: 6 */

import dcone from "../src";

test("dobject fromJS", () => {
    let dobj;

    dobj = dcone.fromJS({ a: { b: { c: 100, d: ['x', 'y'] } } });


    let dobj2 = dcone.branch(dobj);

    expect(dobj.a.b.c).toBe(100);
    dobj.a.b.c = 200;
    expect(dobj.a.b.c).toBe(200);


    console.log(dobj.a.b);
    console.log(dobj2.a.b);
    


    return;

    //     expect(obj).toBeInstanceOf(dcone.DObject);
    //     expect(obj.a).toBeInstanceOf(dcone.DObject);
    //     expect(obj.a.b).toBeInstanceOf(dcone.DObject);
    //     expect(obj.a.b.c).toEqual(100);

    //     expect(obj.a.__signature).toBe('a');
    //     expect(obj.a.b.__signature).toBe('a.b');

    //     let current;

    //     current = obj.__cone.root.__object;
    //     expect(obj.__object).toBe(current);

    //     current = current.get('a').__object;
    //     expect(obj.a.__object).toBe(current);

    //     current = current.get('b').__object;
    //     expect(obj.a.b.__object).toBe(current);
    //     // console.log(current);
});


// test("dobject set", () => {
//     let obj;

//     obj = dcone.fromJS({ a: 1 });
//     expect(obj.a).toBe(1);
//     obj.a = 10;
//     expect(obj.a).toBe(10);


//     obj = dcone.fromJS({
//         a: {
//             b: {
//                 c: {
//                     d: 1,
//                     m: 100
//                 },
//                 z: 10
//             },
//             y: 20
//         },
//         x: 30
//     });
//     expect(obj.a.b.c.d).toBe(1);
//     obj.a.b.c.d = 10;
//     expect(obj.a.b.c.d).toBe(10);
//     // console.log(obj);
// });


// test("dobject delete", () => {
//     let obj = dcone.fromJS({ a: 123, b: 456 });

//     expect(obj.b).toBe(456);
//     expect([...dcone.keys(obj)]).toEqual(['a', 'b']);

//     delete obj.b;
//     expect(obj.b).toBeUndefined();

//     expect(obj.b).toBeUndefined();
//     expect([...dcone.keys(obj)]).toEqual(['a']);
// });
