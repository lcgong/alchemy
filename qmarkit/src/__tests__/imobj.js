/*jshint esversion: 6 */


import dobejct from "../../st";

import { Map, List, Collection } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

const isArrayObject = Array.isArray;
const isPlainObject = function(v) {
    return (v && (v.constructor === Object || v.constructor === undefined));
};
const isImmutable = Immutable.Iterable.isIterable;
const isImmutableMap = Immutable.Map.isMap;
const isImmutableList = Immutable.List.isList;


it("immutable", () => {
    console.log(isImmutable(Immutable.Map({ a: 1, b: 2 })),
        isImmutable(Immutable.List([10, 20, 30])),
        isImmutable([]));

});
