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
    pathJoin,
    setConeIndexedItem,
    deleteConeIndexedItem
} from './cone';

import {
    insertConeListItem,
    removeConeListItem,
    clearConeList,
    unshiftConeListItem,
    pushConeListItem,
    popConeListItem,
    shiftConeListItem,
} from './coneList';

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

function getValueOfStubObject(stub, name, notSetValue) {
    const node = stub.node;
    const value = node.object.get(name, notSetValue);

    if (value instanceof DNode) {
        const path = pathJoin(stub.path, name);
        return createDObject(stub.cone, stub.root, path, value);
    }

    return value;
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

            set: function(target, index, value, receiver) {
                if (name === '__stub') { //  name.startsWith('__')
                    return Reflect.set(...arguments);
                }

                const { cone, path } = target.__stub;
                setConeIndexedItem(cone, path, index, value);

                return true;
            },

            deleteProperty(target, index) {

                const { cone, path } = target.__stub;
                deleteConeIndexedItem(cone, path, index);

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
    constructor(stub) {

        super(stub);

        return new Proxy(this, {
            get: function(target, idx, receiver) {
                if (idx in target || typeof idx === 'symbol' || idx === 'inspect') {
                    return Reflect.get(...arguments);
                }

                return target.get(idx);
            },
            set: function(target, index, value, receiver) {
                if (name === '__stub') { //  name.startsWith('__')
                    return Reflect.set(...arguments);
                }

                target.set(index, value);
                return true; // required to indicate success
            },
            deleteProperty(target, index) {
                this.remove(index);
                return true;
            }
        });
    }

    [Symbol.iterator]() {
        
        const listIter = this.__stub.node.object[Symbol.iterator]();
        return {
            next: listIter.next,
        }
    }

    get(index, notSetValue) {
        return getValueOfStubObject(this.__stub, index, notSetValue);
    }

    set(index, value) {
        const { cone, path } = this.__stub;
        setConeIndexedItem(cone, path, index, value);

        return this;
    }

    get size() {
        return this.__stub.node.object.count()
    }

    get first() {
        return this.__stub.node.object.first()
    }

    get last() {
        return this.__stub.node.object.last()
    }

    insert(index, value) {
        const { cone, path } = this.__stub;
        const change = insertConeListItem(cone, path, index, value);

        return this;
    }

    remove(index) {
        const { cone, path } = this.__stub;
        const change = removeConeListItem(cone, path, index);

        return this;
    }

    clear() {
        const { cone, path } = this.__stub;
        const change = clearConeList(cone, path);

        return this;
    }

    unshift( /*...values*/ ) {
        const { cone, path } = this.__stub;

        const values = arguments;
        unshiftConeListItem(cone, path, values)

        return this;
    }

    push( /*...values*/ ) {
        const { cone, path } = this.__stub;

        const values = arguments;
        pushConeListItem(cone, path, values)

        return this;
    }

    shift() {
        const { cone, path } = this.__stub;
        shiftConeListItem(cone, path)

        return this;
    }

    pop() {
        const { cone, path } = this.__stub;
        popConeListItem(cone, path)

        return this;
    }

}


function isObject(obj){
    return obj instanceof DObject;
}

function isList(obj) {
    return obj instanceof DList;
}

export {
    DObjectCone,
    DList,
    DObject,
    isObject,
    isList,
    branch,
    createDObject,
    keys,
    size
};
