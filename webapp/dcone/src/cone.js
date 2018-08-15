import { Subject } from "rxjs";
import { forwardCursor } from "./path";
import { isImmutableMap, isImmutableList } from "./utils";

class DNode {
    constructor(path, object) {
        this.path = path;
        this.object = object;
        // successors
    }

    succeed(oldNode) {
        if (oldNode.successors === undefined) {
            oldNode.successors = [this];
        } else {
            oldNode.successors.push(this);
        }
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

class DObjectNode extends DNode {

}

class DListNode extends DNode {

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
     * 根据path取值.
     * @param {*} root 
     * @param {*} path 
     */
    getValue(path) {

        return _getValue(this.root, path);
    }

    /**
     * 按照path设置值.
     * @param {*} path 
     * @param {*} value 
     */
    setValue(path, value) {

        // change: {node, root}, the source node of change, the new root    
        let change = _setValue(this.root, forwardCursor(path), value);
        if (change === undefined) {
            return;
        }

        this.root = change.root;

        return change;
    }

    delete(path) {
        let change = _delete(this.root, path)
        if (change === undefined) {
            return;
        }

        this.root = change.root;

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
    subject(path) {
        if (path === undefined) {
            path = '';
        }

        let subject = this._subjects[path];
        if (subject === undefined) {
            subject = new Subject();
            this._subjects[path] = subject;
        }
        return subject;
    }

    emitChangeEvent(change) {
        if (change === undefined) {
            return;
        }

        const pathsToNotify = [''];
        for (let cur = forwardCursor(change.node.path); cur !== undefined; cur = cur.next()) {
            pathsToNotify.push(cur.path);
        }

        const subjects = this._subjects;

        for (let idx = pathsToNotify.length - 1; idx >= 0; idx -= 1) {
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

function _getValue(node, path) {
    console.assert(node instanceof DNode);
    console.assert(path.length == 0 ||
        path.length > 0 && (path[0] === '.' || path[0] === '#'));

    for (let cur = forwardCursor(path); cur !== undefined; cur = cur.next()) {
        node = node.object.get(cur.name);
    }

    return node;
}

/**
 * 按照path设置值.
 * 
 * @param {DNode} node 
 * @param {*} cursor 
 * @param {*} value 
 * @param {*} changed 
 */
function _setValue(node, cursor, value) {

    let stack = [];
    let name;

    while (true) {

        if (cursor === undefined) {
            break;
        }

        name = cursor.name;

        stack.push([node, name]);

        node = node.object.get(name);

        cursor = cursor.next();
    }

    let newnode, oldnode;

    // 末端节点
    let idx = stack.length - 1;
    [oldnode, name] = stack[idx];


    let oldobj = oldnode.object;
    let newobj = oldobj.set(name, value);
    if (newobj === oldobj) {
        return; // no change
    }

    // 对象的值已经发生改变


    newnode = new oldnode.constructor(oldnode.path, newobj);
    newnode.succeed(oldnode);

    let change = {
        node: newnode,
        action: {
            type: 'set',
            index: name,
            value: value
        }
    };

    idx -= 1;

    while (idx >= 0) {
        [oldnode, name] = stack[idx];

        newobj = oldnode.object.set(name, newnode); // set new child node
        newnode = new oldnode.constructor(oldnode.path, newobj);
        newnode.succeed(oldnode);

        idx -= 1;
    }

    change.root = newnode;

    return change;
}


function _delete(node, path) {

    let stack = [];

    for (let cur = forwardCursor(path); cur != undefined; cur = cur.next()) {

        const name = cur.name;

        stack.push([node, name]);

        node = node.object.get(name);
    }

    let name;

    let newnode, oldnode;

    // 末端节点
    let idx = stack.length - 1;
    [oldnode, name] = stack[idx];


    let oldobj = oldnode.object;

    let deleted = oldobj.get(name);
    let newobj = oldobj.delete(name);
    if (newobj === oldobj) {
        return; // no change
    }

    if (deleted instanceof DNode) { // 如果删除属性的值是DNode，以[]表示已经删除
        deleted.successors = [];
    }

    // 对象的值已经发生改变

    newnode = new oldnode.constructor(oldnode.path, newobj);
    newnode.succeed(oldnode);

    let change = {
        node: newnode,
        action: {
            type: 'del',
            index: name
        }
    };

    idx -= 1;

    while (idx >= 0) {
        [oldnode, name] = stack[idx];

        newobj = oldnode.object.set(name, newnode); // set new child node
        newnode = new oldnode.constructor(oldnode.path, newobj);
        newnode.succeed(oldnode);

        idx -= 1;
    }

    change.root = newnode;

    return change;

}


function isIdenticalIn(childRoot, childPath, parentRoot, parentPath) {

    if (childPath.indexOf(parentPath) !== 0) {
        return false;
    }

    // the path pf branch's node should be the prefix of this node
    const relpath = childPath.slice(parentPath.length);


    let node = _getValue(parentRoot, parentPath);

    if (relpath.length > 0) {
        // find forwardly the same opath node in branch node
        for (let cur = forwardCursor(relpath); cur !== undefined; cur = cur.next()) {
            node = node.object.get(cur.name);

            if (node === undefined) {
                return false;
            }
        }
    }

    const childNode = _getValue(childRoot, childPath);

    return childNode.object === node.object;
}

export {
    DNode,
    DObjectNode,
    DListNode,
    Cone,
    isIdenticalIn
};
