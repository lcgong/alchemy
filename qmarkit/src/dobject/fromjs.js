/*jshint esversion: 6 */


import {
    DObject,
    DList
} from "./dobject";

import {
    ImmutableMap,
    ImmutableList,
    isArrayObject,
    isPlainObject,
    NOT_SET_VALUE
} from "./utils";


function fromJS(jsobj) {
    return _fromJS([], null, null, jsobj);
}


function _fromJS(path, index, parent, value) {

    if (isPlainObject(value)) {

        const dobj = new DObject(parent, index);

        const _path = (index === null) ? [...path] : [...path, index];


        let entries = [];
        for (let [k, v] of Object.entries(value)) {
            entries.push([k, _fromJS(_path, k, dobj, v)]);
        }

        dobj.__object = ImmutableMap(entries);
        return dobj;

    } else if (isArrayObject(value)) {

        const dobj = new DList(parent, index);
        const _path = (index === null) ? [...path] : [...path, index];

        let entries = [],
            listIdx = 0;
        for (let v of value) {
            entries.push(_fromJS(_path, listIdx, dobj, v));
            listIdx += 1;
        }

        dobj.__object = ImmutableList(entries);
        return dobj;


        // } else if (value instanceof DReferentProxiedObject) {

        //     return new DReferent(value.__path, value.__referent.__real);

        // } else if (value instanceof DObject) {

        //     if (dobj.__cone.coneID != value.__cone.coneID) {
        //         // came from different cone. use the immutable object.
        //         return getImmutableObject(value);
        //     } else {
        //         return new DReferent(value.__path, value.__path);
        //     }

    } else {
        return value;
    }
}


export { fromJS };
