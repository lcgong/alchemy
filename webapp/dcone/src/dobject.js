/*jshint esversion: 6 */

import Immutable from "immutable/dist/immutable";

import {
    NOT_SET_VALUE,
    isImmutable,
    formatSignature,
    isImmutableMap,
    isImmutableList,
    parseSignature
} from "./utils";
import { throws } from "assert";


import { DNode, getValueInNode, setValueInCone } from './cone';


function changedEventHandler(cone, newroot, changes) {

    const subjects = cone.changedSubjects;

    for (let changed of changes) { // fire changed event
        let subject = subjects[changed.obpath];
        if (subject) {

            subject.next(changed);
        }
    }
}

const DObjectProxyHandler = {
    get: function(target, index, receiver) {
        if (index in target || typeof index === 'symbol' || index === 'inspect') {
            return Reflect.get(...arguments);
        }

        const value = getNode(target).object.get(index);
        return decorateValue(target.__cone, value);
    },
    set: function(target, index, value, receiver) {
        if (index.startsWith('__')) {
            return Reflect.set(...arguments);
        }

        const obpath = `${target.__node.obpath}.${index}`;
        setValueInCone(target.__cone, obpath, value, );

        return true;
    },
    deleteProperty(target, index) {

        updateImmutable(target, (immutable) => {
            return immutable.delete(index);
        });

        return true;
    }
};

function branch(dobj) {

    const cone = dobj.__cone.branch();
    const root = cone.root;

    return createDObject(cone, root, root);
}

function isIdenticalBy(target, whole) {

    let wholeNode = getNode(whole);
    let targetNode = getNode(target);

    return isIdenticalNodeBy()

    if (wholeNode.obpath.indexOf(targetNode.obpath) === 0) {
        // the obpath of target is the prefix of whole's

        let relPath = targetNode.obpath.slice(wholeNode.obpath.length);


    }

    return false;
}

// is identical with

function getNode(dobj) {

    const root = dobj.__cone.root;

    if (dobj.__root !== root) {
        // 如果快照的根与cone的根的不一致，说明数据已经发生变更，重新更新访问对象缓存的对象

        let node = getValueInNode(root, dobj.__node.obpath);
        console.assert(node instanceof DNode);

        dobj.__node = node;
        dobj.__root = root;
    }

    return dobj.__node;
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

    // toString() {
    //     const items = [];
    //     for (let [k, v] of this.__object.entries()) {
    //         items.push(`"${k}": ${v}`);
    //     }
    //     return `DObject {${items.join(', ')}}`;
    // }
}

class DList extends AbstractDObject {

    constructor(cone, root, node) {

        super(cone, root, node);
        return new Proxy(this, DObjectProxyHandler);
    }

}


export {
    DList,
    DObject,
    branch,
    createDObject
};
