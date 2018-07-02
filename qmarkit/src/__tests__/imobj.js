/*jshint esversion: 6 */


import { Map, List, Collection } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";


Immutable.List

pathJoin()

it("immutable", () => {
    let obj = Immutable.List(['a']);

    let obj1 = obj.push('b');
    let obj2 = obj.push('b');

    obj = Immutable.Map();

    obj1 = obj.set(1, 10);
    obj2 = obj.set(1, 10);

    console.log(obj1, obj2, obj1 == obj2);

    // console.log(obj1, obj2, obj1==obj2);

});
