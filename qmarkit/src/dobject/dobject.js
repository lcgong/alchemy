/*jshint esversion: 6 */

import { Map, List } from "immutable/dist/immutable";
import { Iterator } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

class DObject {
    constructor(cone, path, value) {
        this.__cone = cone;
        this.__path = path;

        if (value !== undefined) {
            this.__object = value;
        } else {
            this.__object = cone.root.getIn(path);
        }
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

function wrapObject(cone, path, immutableValue) {
    if (Map.isMap(immutableValue)) {

        return new DObjectDefaultProxy(cone, path, immutableValue);
    } else if (List.isList(immutableValue)) {

        return new DList(cone, path, immutableValue);
    }

    return undefined;
}

function getImmutableObject(dobj) {
    if (dobj.__object !== undefined) {
        return dobj.__object;
    }

    const immutable = dobj.__cone.root.getIn(dobj.__path);
    dobj.__object = immutable;
    return immutable;
}

function getIndexedValue(dobj, index, notSetValue) {

    const cone = dobj.__cone;
    const path = dobj.__path;

    const immutableObj = getImmutableObject(dobj);

    let value = immutableObj.get(index);

    if (value !== undefined) {
        const valueObject = wrapObject(cone, [...path, index], value);
        if (valueObject !== undefined) {
            return valueObject;
        }

        return value;
    }

    if (notSetValue) {
        return notSetValue;
    }
}

function updateImmutable(dobj, func) {
    const cone = dobj.__cone;

    const immutable = getImmutableObject(dobj);
    cone.root = cone.root.setIn(dobj.__path, func(immutable));

    dobj.__object = undefined;
}

const DObjectProxyHandler = {
    get: function(target, prop, receiver) {
        if (prop in target || typeof prop === 'symbol' || prop === 'inspect') {
            return Reflect.get(...arguments);
        }

        return getIndexedValue(target, prop);
    },
    set: function(target, index, value, receiver) {

        updateImmutable(target, (immutable) => {
            return immutable.set(index, value);
        });

        return true;
    }
};

class DObjectDefaultProxy extends DObject {

    constructor(cone, path) {

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
    constructor(cone, path) {

        super(cone, path);
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
        updateImmutable(this, (immutable) => {
            return immutable.set(index, value);
        });

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

export {
    fromJS,
    DObject,
    DList
};
