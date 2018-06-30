/*jshint esversion: 6 */

import { Map, List } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

it("immutable", () => {

    // let obj;

    let obj = Immutable.fromJS([10, 20, 30, 40, 50, 60]);
    console.log('size: ', obj.size);

    console.log(obj.insert(-2,100));
    console.log(obj);
    console.log(obj.get('-1'));

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


});
