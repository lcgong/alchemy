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

function updateImmutable(target, index, updateFn) {

    const newImmutable = updateFn(target.__object);

    if (target.__parent === null) {
        target.__object = newImmutable;

    } else {

        const newObject = new(target.constructor)(null, index);
        newObject.__object = newImmutable;
        const parent = setImmutable(target.__parent, target.__index, newObject);
        newObject.__parent = parent;

        return newObject;

    }
    return target;
}

function setImmutable(target, index, value) {

    const newImmutable = target.__object.set(index, value);

    if (target.__parent === null) {

        target.__object = newImmutable;

    } else {

        const newObject = new(target.constructor)(null, index);
        newObject.__object = newImmutable;
        const parent = setImmutable(target.__parent, target.__index, newObject);
        newObject.__parent = parent;

        return newObject;
    }

    return target;
}


const DObjectProxyHandler = {
    get: function(target, index, receiver) {

        if (index in target || typeof index === 'symbol' || index === 'inspect') {
            return Reflect.get(...arguments);
        }

        let value = target.__object.get(index, NOT_SET_VALUE);
        if (value !== NOT_SET_VALUE) {
            return value;
        }
    },
    set: function(target, index, value, receiver) {
        if (index.startsWith('__')) {
            return Reflect.set(...arguments);
        }

        setImmutable(target, index, value);

        return true;
    },
    deleteProperty(target, index) {

        updateImmutable(target, index, (immutable) => {
            return immutable.delete(index);
        });

        return true;
    }
};

class DList extends AbstractDObject {

}

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


export {
    DList,
    DObject
};
