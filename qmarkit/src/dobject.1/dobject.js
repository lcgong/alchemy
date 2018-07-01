/*jshint esversion: 6 */

import { Map, List, Iterator } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

class DObject {
    constructor(cone, path, value) {
        this.__cone = cone;
        this.__path = path;

        if (value !== undefined) {
            this.__object = value;
        } else {
            this.__object = undefined;
        }

        // if (value !== undefined) {
        //     this.__object = value;
        // } else {
        //     this.__object =  getImmutableWitPath(cone.root, path);
        //     // this.__object = getImcone.root.getIn(path);
        // }
    }
}

function fromJS(jsobj) {

    const immutable = Immutable.fromJS(jsobj);
    const cone = {
        coneID: new ConeID(),
        root: immutable
    };

    const obj = wrapObject(cone, [], immutable);
    if (!obj) {
        throw new InvalidDataError();
    }

    return obj;
}


// A function which returns a value representing an unique ID for a cone.
function ConeID() {}

function wrapObject(cone, path, value) {
    console.log('wrapObject: ', cone, path, value);
    if (Map.isMap(value)) {

        return new DObjectDefaultProxy(cone, path, value);

    } else if (List.isList(value)) {

        return new DList(cone, path, value);

    } else if (value instanceof DReferent) {

        const referent = new DReferent(value.__path, value.__real);

        return new DReferentProxiedObject(cone, path, referent);
    }

    return undefined;
}

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
const NOT_SET_VALUE = {};

function getImmutableWitPath(root, path, notSetValue) {

    let immutable = root;
    for (let i = 0, lenOfPath = path.length; i < lenOfPath; i++) {
        immutable = immutable.get(path[i], NOT_SET_VALUE);
        // console.log(123, path, path[i], immutable);
        if (immutable === NOT_SET_VALUE) {
            return notSetValue;
        } else if (immutable instanceof DReferent) {
            return getImmutableWitPath(root, immutable.__real, notSetValue);
        }
    }

    return immutable;
}

function getImmutableObject(dobj) {
    if (dobj.__object !== undefined) {
        return dobj.__object;
    }

    const immutable = getImmutableWitPath(dobj.__cone.root, dobj.__path);
    if (!(dobj instanceof DReferent)) {
        dobj.__object = immutable;
    }
    
    return immutable;
}

function getIndexedValue(dobj, index, notSetValue) {

    const cone = dobj.__cone;

    const immutableObj = getImmutableObject(dobj);

    console.log('get:', index);

    let value = immutableObj.get(index, NOT_SET_VALUE);
    if (value !== NOT_SET_VALUE) {
        let path = [...dobj.__path, index];
        console.log(776, path, value);
        if (value instanceof DReferent) {
            let refObj = getImmutableWitPath(cone.root, value.__real, NOT_SET_VALUE);
            if (refObj === NOT_SET_VALUE) {
                const pathStr = toPathString(refObj.__real);
                throw new TypeError(`The path '${pathStr}' is inaccessible`);
            } 

            console.log(778, path, value, refObj);
            const valueObject = wrapObject(cone, path, refObj);
            if (valueObject !== undefined) {
                return valueObject;
            }            
        } else {
            const valueObject = wrapObject(cone, path, value);
            if (valueObject !== undefined) {
                return valueObject;
            }
        }
        


        return value;
    }

    if (notSetValue) {
        return notSetValue;
    }
}


const isArray = Array.isArray;

function isPlainObj(value) {
    return (
        value && (value.constructor === Object || value.constructor === undefined)
    );
}

function buildImmutableObjectFromJS(dobj, value) {
    if (isArray(value)) {

        let entries = [];
        for (let v of value) {
            entries.push(buildImmutableObjectFromJS(dobj, v));
        }
        return Immutable.List(entries);

    } else if (isPlainObj(value)) {

        let entries = [];
        for (let [k, v] of Object.entries(value)) {
            entries.push([k, buildImmutableObjectFromJS(dobj, v)]);
        }

        return Immutable.Map(entries);

    } else if (value instanceof DReferentProxiedObject) {

        return new DReferent(value.__path, value.__referent.__real);

    } else if (value instanceof DObject) {

        if (dobj.__cone.coneID != value.__cone.coneID) {
            // came from different cone. use the immutable object.
            return getImmutableObject(value);
        } else {
            return new DReferent(value.__path, value.__path);
        }

    } else {
        return value;
    }
}

/**
 * 同Cone，采用引用方式
 * 
 * 
 */

function mergeIndexedValue(target, index, newValue) {

    console.log('set: ', index, newValue);

    if (newValue === undefined || newValue === null) {

        updateImmutable(target, (immutable) => {
            return immutable.set(index, newValue);
        });
    } else if (isArray(newValue) || isPlainObj(newValue) || newValue instanceof DObject) {

        newValue = buildImmutableObjectFromJS(target, newValue);
    }

    const immutableObj = getImmutableObject(target);
    let oldValue = immutableObj.get(index);
    console.log('merge: ', index, immutableObj, oldValue, newValue);

    if (Map.isMap(oldValue) || List.isList(oldValue)) {
        const merged = oldValue.mergeDeep(newValue);
        updateImmutable(target, (immutable) => {
            return immutable.set(index, oldValue.mergeDeep(newValue));
        });
    } else {
        updateImmutable(target, (immutable) => {
            return immutable.set(index, newValue);
        });
    }
}

function keys(dobj) {
    return dobj.__cone.root.keys();
}

function updateImmutable(dobj, func) {
    const cone = dobj.__cone;

    const immutable = getImmutableObject(dobj);
    cone.root = cone.root.setIn(dobj.__path, func(immutable));

    dobj.__object = undefined;
}

const DObjectProxyHandler = {
    get: function(target, prop, receiver) {
        console.log('proxy: get:', prop);

        if (prop in target || typeof prop === 'symbol' || prop === 'inspect') {
            return Reflect.get(...arguments);
        }

        return getIndexedValue(target, prop);
    },
    set: function(target, index, value, receiver) {

        console.log('set2, ', index, value)

        if (value === undefined) {
            updateImmutable(target, (immutable) => {
                return immutable.delete(index);
            });
        } else {
            mergeIndexedValue(target, index, value);
        }

        return true;
    }
};

class DObjectDefaultProxy extends DObject {

    constructor(cone, path) {

        console.log('111', path);

        super(cone, path);
        return new Proxy(this, DObjectProxyHandler);
    }

    toString() {
        let immutable = this.__cone.root.getIn(this.__path);
        return `DObject ${immutable}`;
    }
}

const DListProxyHandler = {
    get: function(target, idx, receiver) {
        if (idx in target || typeof idx === 'symbol' || idx === 'inspect') {
            return Reflect.get(...arguments);
        }

        if (typeof idx !== 'number') { // array index as string
            idx = parseInt(idx);
        }

        return target.get(idx);
    },
    set: function(target, index, value, receiver) {
        if (index.startsWith('__')) {
            return Reflect.set(...arguments);
        }
        target.set(index, value);
        return true; // required to indicate success
    }
};

class DList extends DObject {
    constructor(cone, path, value) {

        super(cone, path, value);
        return new Proxy(this, DListProxyHandler);
    }


    get(index, notSetValue) {

        return getIndexedValue(this, index, notSetValue);
    }

    [Symbol.iterator]() {
        const immutableList = getImmutableObject(this);
        const iterator = immutableList.__iterator(1); // 1 means Iterator.VALUES

        return {
            next: () => {
                const nextValue = iterator.next();
                // console.log(8888, nextValue);
                return nextValue;
            }
        }
    }

    set(index, value) {
        mergeIndexedValue(this, index, value);
        return this;
    }

    remove(index) {
        updateImmutable(this, (immutable) => {
            return immutable.remove(index);
        });

        return this;
    }

    insert(index, value) {
        updateImmutable(this, (immutable) => {
            return immutable.insert(index, value);
        });

        return this;
    }

    clear() {
        updateImmutable(this, (immutable) => {
            return immutable.clear();
        });

        return this;
    }

    push( /*...values*/ ) {
        updateImmutable(this, (immutable) => {
            return immutable.push(...arguments);
        });

        return this;
    }

    pop() {
        updateImmutable(this, (immutable) => {
            return immutable.pop();
        });
        return this;
    }

    unshift( /*...values*/ ) {
        updateImmutable(this, (immutable) => {
            return immutable.unshift(...arguments);
        });

        return this;
    }

    shift() {
        updateImmutable(this, (immutable) => {
            return immutable.shift();
        });

        return this;
    }
}

class DReferentProxiedObject extends DObject {
    constructor(cone, path, referent) {

        super(cone, path);
        this.__referent = referent;
    }
}


class DReferent {
    constructor(path, real) {
        this.__path = path;
        this.__real = real;
    }

    toString() {
        if (this.__path == this.__real) {

            return `DReferent [${toPathString(this.__path)}]`;
        } else {

            return `DReferent [${toPathString(this.__path)}] => [${toPathString(this.__real)}]`;
        }
    }
}

function toPathString(path) {
    const segments = [];
    for (let p of path) {
        if (Number.isInteger(p)) {
            segments.push(`[${p}]`);
        } else {
            segments.push(p);
        }
    }

    return segments.join('.');
}

export {
    fromJS,
    DObject,
    DList,
    keys
    // NOT_SET_VALUE
};
