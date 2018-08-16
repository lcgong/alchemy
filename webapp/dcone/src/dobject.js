import {
    NOT_SET_VALUE,
    isImmutableMap,
    isImmutableList,
} from "./utils";

import {
    Cone,
    DNode,
    DObjectNode,
    DListNode,
    _getValue,
    pathJoin
} from './cone';


function branch(dobj) {

    const stub = dobj.__stub;

    const cone = stub.cone.branch();
    const node = _getValue(cone.root, stub.path);

    return createDObject(cone, cone.root, stub.path, node);
}

function keys(dobj) {
    return dobj.__stub.node.object.keys();
}

function size(dobj) {
    return dobj.__stub.node.object.size;
}


function isIdenticalIn(targetObj, parentObj) {
    const targetStub = targetObj.__stub;
    const parentStub = parentObj.__stub;

    return isIdenticalIn(targetStub.root, targetStub.path,
        parentStub.root, parentStub.path);
}


/**
 * 先从对象的缓存读取节点，如果根与cone的根不一致，重新读取更新缓存
 * @param {*} dobj 
 */
function getNodeFromStub(stub) {

    const root = stub.cone.root; // cone当前最新的root

    if (stub.root !== root) {
        // 如果快照的根与cone的根的不一致，说明数据已经发生变更，重新更新访问对象缓存的对象

        const node = _getValue(root, stub.path);
        stub.node = node
        stub.root = root;

        return node;

    } else {

        return stub.node;
    }
}

function getValueOfStubObject(stub, name) {
    const node = stub.node;
    const value = node.object.get(name);

    if (value instanceof DNode) {
        const path = pathJoin(stub.path, name);
        return createDObject(stub.cone, stub.root, path, value);
    }

    return value;
}


function setValueOfStubObject(stub, name, value) {
    const path = pathJoin(stub.path, name);
    let change = stub.cone.setValue(pathJoin(path, name), value);
}


function deletePropertyOfStubObject(stub, name) {

    let change = stub.cone.delete(pathJoin(stub.path, name));
}

function createDObject(cone, root, path, node) {

    let dobjectConstructor;
    if (node instanceof DObjectNode) {
        dobjectConstructor = DObject;
    } else if (node instanceof DListNode) {
        dobjectConstructor = DList;
    } else throw new TypeError('should be a DNode')

    const stub = new DStub(cone, root, path, node);
    return new dobjectConstructor(stub);
}


class DObjectCone extends Cone {

}

// stub: {cone, root, node, path}
// 在stub里，如果和cone的root不一致，则该代理的对象已经发生更改

class DStub {

    constructor(cone, root, path, node) {
        this._cone = cone;
        this._root = root;
        this._path = path;
        this._node = node;
    }

    get cone() {
        return this._cone;
    }

    get path() {
        return this._path;
    }

    get root() {
        this._check();
        return this._root;
    }

    get node() {
        this._check();
        return this._node;
    }

    _check() {
        const root = this._cone.root; // cone当前最新的root

        if (this._root !== root) {
            const node = _getValue(root, this._path);
            this._node = node
            this._root = root;
        }
    }
}


class DObjectProxy {

    constructor(stub) {

        this.__stub = stub;
    }
}

class DObject extends DObjectProxy {

    constructor(stub) {

        super(stub);

        return new Proxy(this, {
            get: function(target, name, receiver) {
                if (name in target || typeof name === 'symbol' || name === 'inspect') {
                    return Reflect.get(...arguments);
                }

                return getValueOfStubObject(target.__stub, name);
            },

            set: function(target, name, value, receiver) {
                if (name === '__stub') { //  name.startsWith('__')
                    return Reflect.set(...arguments);
                }

                setValueOfStubObject(target.__stub, name, value);

                return true;
            },

            deleteProperty(target, name) {

                deletePropertyOfStubObject(target.__stub, name)

                return true;
            }
        });
    }

    toString() {
        const items = [];
        for (let [k, v] of this.__object.entries()) {
            items.push(`"${k}": ${v}`);
        }
        return `DObject {${items.join(', ')}}`;
    }
}

class DList extends DObjectProxy {

    constructor(cone, root, node, path) {

        super(cone, root, node, path);
        return new Proxy(this, DObjectProxyHandler);
    }

}

// https://github.com/lcgong/alchemy/blob/62804efc8443b71123e9bfad555fe1a331b01d6b/qmarkit/src/dobject/dobject.js

const DObjectProxyHandler = {
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
    DObjectCone,
    DList,
    DObject,
    branch,
    createDObject,
    keys,
    size
};
