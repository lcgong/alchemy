import {
    PathForwardCursor
} from "./path";

import {
    ImmutableMap,
    ImmutableList,
    isArrayObject,
    isPlainObject,
    isImmutableMap,
    isImmutableList,
    NOT_SET_VALUE,
    ConeID,
    formatSignature
} from "./utils";

import { Subject } from "rxjs";

class DNode {
    constructor(obpath, object) {
        this.obpath = obpath;
        this.object = object;
        this.successor = undefined; // 如果该对象存在继承者，说明其已经陈旧 
    }

    isIdenticalIn(node) {
        // console.log()
        if (this.obpath.indexOf(node.obpath) !== 0) {
            return false;
        }

        // the obpath pf branch's node should be the prefix of this node

        const relpath = this.obpath.slice(node.obpath.length);

        if (relpath.length > 0) {
            // find forwardly the same opath node in branch node    
            let cur = new PathForwardCursor(relpath).next();
            for (; cur !== undefined; cur = cur.next()) {
                node = node.object.get(cur.name);
                if (node === undefined) {
                    return false;
                }
            }
        }

        return this.object === node.object;
    }

    toString() {
        const obj = this.object;

        if (isImmutableMap(obj)) {
            const items = [];
            for (let [k, v] of obj.entries()) {
                items.push(`"${k}": ${v}`);
            }
            return `{ ${items.join(', ')} }`
        } else if (isImmutableList(obj)) {
            const items = [];
            for (let v of obj) {
                if (typeof v === 'string') {
                    items.push(`"${v}"`);
                } else {
                    items.push(`${v}`);
                }
            }
            return `[ ${items.join(', ')} ]`
        }

        return `${obj}`;
    }
}

function getValueInNode(root, obpath) {
    if (!(root instanceof DNode)) {
        throw new TypeError(`an instance of DNode is required`);
    }

    let node = root;
    let cur = new PathForwardCursor(obpath).next();

    for (; cur !== undefined; cur = cur.next()) {
        node = node.object.get(cur.name);
    }

    return node;
}


function setValue(node, cursor, value, changes) {

    const obj = node.object;
    const name = cursor.name;

    const next = cursor.next();
    if (next !== undefined) {
        value = setValue(obj.get(name), next, value, changes);
    }

    const newobj = obj.set(name, value);
    if (newobj !== obj) {
        let newnode = new DNode(node.obpath, newobj);
        node.successor = newnode;

        changes.push(newnode);

        return newnode;
    } else {
        return node;
    }
}

function setValueInCone(cone, obpath, value,
    changedHandler = defaultChangedHandler) {

    let cur = new PathForwardCursor(obpath).next();
    let newNodes = [];

    const root = cone.root;
    let newroot = setValue(root, cur, value, newNodes);
    cone.root = newroot;

    if (changedHandler !== undefined) { // fire changed event

        const subjects = cone.changedSubjects;

        for (let newNode of newNodes) { // fire changed event

            let subject = subjects[newNode.obpath];
            if (subject) {

                changedHandler(subject, newNode, newroot, cone);
            }
        }
    }
}


function defaultChangedHandler(subject, newNode, newRoot, cone) {
    subject.next(newNode);
}

class Cone {

    constructor(root) {
        this.root = root;
        this.changedSubjects = {};
    }


    branch() {
        const cone = new Cone(this.root)
        return cone;
    }

    // object
    getChangedSubject(obpath) {
        let subject = this.changedSubjects[obpath];
        if (subject === undefined) {
            subject = new Subject();
            this.changedSubjects[obpath] = subject;
        }
        return subject;
    }
}

function transformChangedObject(changed) {
    return changed;
}


export {
    DNode,
    Cone,
    getValueInNode,
    setValueInCone
};
