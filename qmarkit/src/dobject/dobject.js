/*jshint esversion: 6 */

import Immutable from "immutable/dist/immutable";
import { isArrayObject, isPlainObject, NOT_SET_VALUE, isImmutable } from "./utils";

class AbstractDObject {

    constructor(cone, path) {
        this.__cone = cone;
        this.__path = path;
        this.__object = null;
    }
}

function updateImmutable(target, updateFn) {

    const newObject = new(target.constructor)(target.__cone, target.__path);
    newObject.__object = updateFn(target.__object);

    const root = target.__cone.root;
    const newRoot = _setImmutable(root, target.__path, 0, newObject);
    root.__object = newRoot.__object;
}

function spawnDObject(dobj) {
    return new(dobj.constructor)(dobj.__cone, dobj.__path);
}

function setImmutable(target, index, value) {

    const root = target.__cone.root;
    const newRoot = _setImmutable(root, [...target.__path, index], 0, value);
    root.__object = newRoot.__object;
}

function _setImmutable(dobj, path, level, value) {

    if (path.length === 0) {
        if (!(value instanceof AbstractDObject)) {
            throw new TypeError('value should be a dobject or dlist');
        }

        const newobj = spawnDObject(dobj);
        newobj.__object = value.__object;
        return newobj;
    }

    if (level < path.length - 1) {

        const newobj = spawnDObject(dobj);

        const propValue = _setImmutable(
            dobj.__object.get(path[level]), path, level + 1, value);

        newobj.__object = dobj.__object.set(path[level], propValue);

        return newobj;
    }

    // the last index of path
    const newobj = spawnDObject(dobj);
    newobj.__object = dobj.__object.set(path[level], value);

    return newobj;
}


function getImmutable(dobj, index, notSetValue) {

    console.assert(dobj instanceof AbstractDObject);

    const cone = dobj.__cone;

    let current = cone.root;
    for (let idx of dobj.__path) {
        current = current.__object.get(idx, notSetValue);
        if (current === notSetValue) {
            return notSetValue;
        }
    }

    let value = current.__object.get(index, notSetValue);

    if (value === notSetValue) {
        return notSetValue;
    }

    return value;
}

const DObjectProxyHandler = {
    get: function(target, index, receiver) {
        if (index in target || typeof index === 'symbol' || index === 'inspect') {
            return Reflect.get(...arguments);
        }

        let value = getImmutable(target, index, NOT_SET_VALUE);
        if (value !== NOT_SET_VALUE) {
            return value;
        }

        return undefined;

    },
    set: function(target, index, value, receiver) {
        if (index.startsWith('__')) {
            return Reflect.set(...arguments);
        }

        setImmutable(target, index, value);

        return true;
    },
    deleteProperty(target, index) {

        updateImmutable(target, (immutable) => {
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
