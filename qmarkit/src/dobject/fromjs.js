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
    NOT_SET_VALUE,
    ConeID
} from "./utils";


function fromJS(jsobj) {
    const cone = {
        coneId: new ConeID(),
        root: null,
    };

    const obj = _fromJS(cone, [], null, jsobj);
    obj.__cone.root = obj;

    return obj;
}


function _fromJS(cone, path, index, value) {

    if (isPlainObject(value)) {

        const _path = (index === null) ? [...path] : [...path, index];

        let entries = [];
        for (let [k, v] of Object.entries(value)) {
            entries.push([k, _fromJS(cone, _path, k, v)]);
        }

        const dobj = new DObject(cone, _path);
        dobj.__object = ImmutableMap(entries);
        return dobj;

    } else if (isArrayObject(value)) {

        const _path = (index === null) ? [...path] : [...path, index];

        let entries = [],
            listIdx = 0;
        for (let v of value) {
            entries.push(_fromJS(cone, _path, listIdx, v));
            listIdx += 1;
        }

        const dobj = new DList(cone, _path);
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
