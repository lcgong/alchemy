/*jshint esversion: 6 */

import Immutable from "immutable/dist/immutable";
import { isArrayObject, isPlainObject, NOT_SET_VALUE } from "./utils";

class AbstractDObject {

    constructor(parent, index) {
        this.__parent = parent;
        this.__index = index;

        this.__referred = null;
        this.__object = null;
    }

}


// function updateImmutable(target, index, updateFn) {
//     // const parent = target.__parent;

//     const newObject = updateFn(target.__object);
//     // const newObject = target.__object.set(index, value);

//     if (target.__parent === null) {
//         target.__object = newObject;
//     } else {
//         setImmutable(target.__parent, target.__index, newObject);
//     }
// }

function setImmutable(target, index, value) {

    const newImmutable = target.__object.set(index, value);

    if (target.__parent === null) {
        target.__object = newImmutable;
    } else {
        const newObject = new DObject(null, index);
        newObject.__object = newImmutable;
        const parent = setImmutable(target.__parent, target.__index, newObject);
        newObject.__parent = parent;

        return newObject;
    }

    // console.log('post: ', newObject);

    return target;
}


const DObjectProxyHandler = {
    get: function(target, index, receiver) {

        if (index in target || typeof index === 'symbol' || index === 'inspect') {
            return Reflect.get(...arguments);
        }

        console.log('333', index, target.__object);

        let value = target.__object.get(index, NOT_SET_VALUE);
        if (value !== NOT_SET_VALUE) {
            return value;
        }
    },
    set: function(target, index, value, receiver) {
        if (index.startsWith('__')) {
            return Reflect.set(...arguments);
        }

        if (value === undefined) {
            // updateImmutable(target, (immutable) => {
            //     return immutable.delete(index);
            // });

            return true;
        }

        setImmutable(target, index, value);

        // updateImmutable(target, index, (immutable) => {
        //     return immutable.set(index, value);
        // });
        // else {
        //     mergeIndexedValue(target, index, value);
        // }

        return true;
    }
};

class DObject extends AbstractDObject {

    constructor(parent, index) {
        super(parent, index);
        return new Proxy(this, DObjectProxyHandler);
    }

    toString() {

        const items = [];
        for (let [k, v] of this.__object.entries()) {
            items.push(`"${k}": ${v}`);
        }
        return `DObject {${items.join(', ')}}`;
    }

}

class DList extends AbstractDObject {

}


function fromJS(jsobj) {
    return _fromJS([], null, null, jsobj);
}


function _fromJS(path, index, parent, value) {
    console.log(path, index);

    if (isPlainObject(value)) {

        const dobj = new DObject(parent, index);

        const _path = (index === null) ? [...path] : [...path, index];


        let entries = [];
        for (let [k, v] of Object.entries(value)) {
            entries.push([k, _fromJS(_path, k, dobj, v)]);
        }

        dobj.__object = Immutable.Map(entries);
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

        dobj.__object = Immutable.List(entries);
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

export default {
    DList,
    DObject,
    fromJS,
};
