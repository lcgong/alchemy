/*jshint esversion: 6 */

import { Map, List } from "immutable/dist/immutable";
import { Iterator } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

// from {iterateList}

// console.log('Immutable', Immutable);

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


function getImmutableObject(dobj) {
    if (dobj.__object != undefined) {
        return dobj.__object;
    }

    const immutable = dobj.__cone.root.getIn(dobj.__path);
    dobj.__object = immutable;
    return immutable;
}

function setImmutablePropeties(dobj, prop, value) {
    const root = dobj.__cone.root;
    dobj.__cone.root = root.setIn([...dobj.__path, prop], value);
}

function updateImmutable(dobj, func) {
    const cone = dobj.__cone;
    const path = dobj.__path;

    const immutable = getImmutableObject(dobj);
    cone.root = cone.root.setIn(path, func(immutable));

    // console.log(4422255, cone.root);
    dobj.__object = undefined;
}


// function arrayPathEquals(path1, path2) {
//     if (path1.length != path2.length)
//         return false;

//     for (var i = 0, l = path1.length; i < l; i++) {
//         if (path1[i] != path2[i]) {
//             return false;
//         }
//     }
//     return true;
// }


function fromJS(jsobj) {

    const immutable = Immutable.fromJS(jsobj);
    const cone = {
        coneID: new ConeID(),
        root: immutable
    };

    const obj = makeObject(cone, [], immutable);
    if (!obj) {
        throw new InvalidDataError();
    }

    return obj;
}


// A function which returns a value representing an unique ID for a cone.
function ConeID() {

}

function makeObject(cone, path, immutableObj) {
    if (immutableObj !== undefined) {
        if (Map.isMap(immutableObj)) {

            return new DObjectDefaultProxy(cone, path, immutableObj);
        } else if (List.isList(immutableObj)) {

            return new DList(cone, path, immutableObj);
        }
    } else {
        immutableObj = cone.root.getIn(path);
        if (Map.isMap(immutableObj)) {

            return new DObjectDefaultProxy(cone, path, immutableObj);
        } else if (List.isList(immutableObj)) {

            return new DList(cone, path, immutableObj);
        }
    }

}


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

const DObjectProxyHandler = {
    get: function(target, prop, receiver) {
        // console.log('prop: ', prop, prop in target);
        // if (prop in target) {
        //     return target[prop];
        // }

        // if (typeof prop === 'symbol') {
        //     return Reflect.get(...arguments)
        // }
        if (prop in target || typeof prop === 'symbol' || prop === 'inspect') {
            return Reflect.get(...arguments);
        }

        const cone = target.__cone;
        const path = target.__path;

        let immutableObj = cone.root.getIn(path);
        let propValue = immutableObj.get(prop);
        // console.log(111, prop, value);
        if (propValue !== undefined) {
            const obj = makeObject(cone, [...path, prop], propValue);
            if (obj instanceof DObject) {
                return obj;
            }

            return propValue;
        }

        return Reflect.get(...arguments);
    },
    set: function(target, prop, value, receiver) {
        setImmutablePropeties(target, prop, value);
        return true; // Indicate success
    }

};


var DListProxyHandler = {
    get: function(target, idx, receiver) {
        if (idx in target || typeof idx === 'symbol' || idx === 'inspect') {
            return Reflect.get(...arguments);
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
        const mutableList = getImmutableObject(this);
        return mutableList.get(index, notSetValue);
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

// Object.defineProperty(DList.prototype, "[]", {
//     value: function(index) {
//         console.log(2233444, index);
//         return this.myArray[index];
//     }
// });


export {
    fromJS,
    DObject,
    setImmutablePropeties,
    updateImmutable
};
