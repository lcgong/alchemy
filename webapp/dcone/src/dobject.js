import {
    NOT_SET_VALUE,
    isImmutableMap,
    isImmutableList,
} from "./utils";

import { DNode } from './cone';

/**
 * 先从对象的缓存读取节点，如果根与cone的根不一致，重新读取更新缓存
 * @param {*} dobj 
 */
function getNode(dobj) {

    const cone = dobj.__cone;

    const root = dobj.__cone.root;

    if (dobj.__root !== cone.root) {
        // 如果快照的根与cone的根的不一致，说明数据已经发生变更，重新更新访问对象缓存的对象

        dobj.__node = cone.getValue(dobj.__node.path);
        dobj.__root = cone.root;
    }

    return dobj.__node;
}

const DObjectProxyHandler = {
    get: function(target, name, receiver) {
        if (name in target || typeof name === 'symbol' || name === 'inspect') {
            return Reflect.get(...arguments);
        }

        const value = getNode(target).object.get(name);
        return decorateValue(target.__cone, value);
    },
    set: function(target, name, value, receiver) {
        if (name.startsWith('__')) {
            return Reflect.set(...arguments);
        }

        const cone = target.__cone;
        const path = `${target.__node.path}.${name}`;
        let change = cone.setValue(path, value);
        return true;
    },
    deleteProperty(target, name) {
        const cone = target.__cone;
        let change = cone.delete(`${target.__node.path}.${name}`)
        console.log(111, change);

        return true;
    }
};

function branch(dobj) {

    const cone = dobj.__cone.branch();
    const root = cone.root;

    return createDObject(cone, root, root);
}

function isIdenticalIn(targetObj, parentObj) {

    return getNode(targetObj).isIdenticalIn(getNode(parentObj))
}




function decorateValue(cone, value) {
    if (value instanceof DNode) {
        return createDObject(cone, cone.root, value);
    }

    return value;
}

function createDObject(cone, root, node) {
    const object = node.object;
    if (isImmutableMap(object)) {
        return new DObject(cone, root, node);
    } else if (isImmutableList(object)) {
        return new DList(cone, root, node);
    }
}

class AbstractDObject {

    constructor(cone, root, node) {

        this.__cone = cone;
        this.__node = node;
        this.__root = root;
    }
}

class DObject extends AbstractDObject {

    constructor(cone, root, node) {

        super(cone, root, node);
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

    constructor(cone, root, node) {

        super(cone, root, node);
        return new Proxy(this, DObjectProxyHandler);
    }

}

// https://github.com/lcgong/alchemy/blob/62804efc8443b71123e9bfad555fe1a331b01d6b/qmarkit/src/dobject/dobject.js

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

class DList2 extends DObject {
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
    DList,
    DObject,
    branch,
    createDObject
};
