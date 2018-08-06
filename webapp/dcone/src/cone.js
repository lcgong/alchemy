import {
    forwardCursor
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
            for (let cur = forwardCursor(relpath); cur !== undefined; cur = cur.next()) {
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



/**
 * 按照obpath设置值.
 * 
 * @param {DNode} node 
 * @param {*} cursor 
 * @param {*} value 
 * @param {*} changed 
 */
function _setValue(node, cursor, value, change) {

    const obj = node.object;
    const name = cursor.name;

    const next = cursor.next();
    if (next !== undefined) {
        value = _setValue(obj.get(name), next, value, change);
    }

    const newobj = obj.set(name, value);
    if (newobj === obj) { // 设置的值和原来的是同一个，因此，节点也保持原来的那个
        return node;
    }

    // 对象的值已经发生改变
    let newnode = new DNode(node.obpath, newobj);
    node.successor = newnode;

    if (change.node === undefined) { // 仅标记最末端实质性发生变更的节点
        change.node = newnode;
    }

    return newnode;
}

/**
 * 
 */
class Cone {

    constructor(root) {
        this.root = root;
        this._subjects = {};
    }



    /**
     * 根据obpath取值.
     * @param {*} root 
     * @param {*} obpath 
     */
    getValue(obpath) {

        let node = this.root;
        for (let cur = forwardCursor(obpath); cur !== undefined; cur = cur.next()) {
            node = node.object.get(cur.name);
        }
    
        return node;
    }

    /**
     * 按照obpath设置值.
     * @param {*} obpath 
     * @param {*} value 
     */
    setValue(obpath, value) {
    
        let change = {}; // root, node
    
        const oldRoot = this.root;
    
        let newRoot = _setValue(this.root, forwardCursor(obpath), value, change);
    
        if (oldRoot === newRoot) {
            return;
        }
    
        this.root = newRoot;
        change.root = newRoot;
    
        return change;
    }

    /**
     * 
     */
    branch() {
        const cone = new Cone(this.root);
        return cone;
    }
    
    /**
     * 
     */
    clone() {
        const cone = new Cone(this.root);
        cone._subjects = Object.assign({}, this._subjects);
        return cone;
    }

    // object
    subject(obpath) {
        if (obpath === undefined) {
            obpath = '';
        }

        let subject = this._subjects[obpath];
        if (subject === undefined) {
            subject = new Subject();
            this._subjects[obpath] = subject;
        }
        return subject;
    }

    emitChangeEvent(change) {
        if (change === undefined) {
            return;
        }

        const pathsToNotify = [''];
        for (let cur = forwardCursor(change.node.obpath); cur !== undefined; cur=cur.next()) {
            pathsToNotify.push(cur.path);
        }

        const subjects = this._subjects;

        for (let idx = pathsToNotify.length -1; idx>=0; idx -= 1) {
            let subject = subjects[pathsToNotify[idx]];
            if (subject) {
                subject.next(this.makeChangeMessage(change));
            }
        }
    }

    makeChangeMessage(change) {
        return change;
    }
}


export {
    DNode,
    Cone,
};
