import { Map, List } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

import { DObject } from "../dobject/dobject";

it("immutable", () => {

    let obj;

    // obj = { a: 1, b: [1,2,3]};
    // let obj1 = Immutable.fromJS(obj);
    // let obj2 = obj1.withMutations((mutable)=> {
    //     let b = mutable.get('b');
    //     let b2 = b.withMutations((m)=>{
    //         m.push(10);
    //     })

    //     mutable.set('b', b2);
    //     console.log(2233, b2);
    // });

    // console.log(obj2);

    // // console.log(obj1 == obj2);

    // // console.log(123, Immutable.fromJS(obj).getIn([]))
    // return;

    obj = { a: 1, b: { x: [7, 8, 9], y: 20 } };


    let p = DObject.fromJS(obj);

    // console.log(p)

    DObject.snapshot(p);

    let value = p.b.x[1];
    p.b.x[1] = 100;
    p.b.x.pop().push(10).insert(0, 20);

    DObject.snapshot(p);
    DObject.snapshot(p);
    p.a = 123;
    DObject.snapshot(p);

    // console.log(33222, p.b.x);

    console.log(p);
    console.log(p.__domain.history);

});
