import { Subject } from "rxjs";
import { forwardCursor } from "./path";
import { isImmutableMap, isImmutableList } from "./utils";

class DNode {
    constructor(object) {
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

        const { changeset, newRoot, oldRoot } = change;

        _emitChangeEvent(this._subjects, '',
            changeset, newRoot, oldRoot, this.makeChangeMessage)
    }

    makeChangeMessage(change) {
        return change;
    }
}

function pathJoin(path, idx) {
    return `${path}${Number.isInteger(idx)?'#':'.'}${idx}`;
}

function _emitChangeEvent(subjects, path, changeset, newRoot, oldRoot, messageFn) {

    for (let [name, delta] of changeset) {
        const childPath = pathJoin(path, name);
        if (Array.isArray(delta)) {
            _emitChangeEvent(subjects, childPath, delta, newRoot, oldRoot, messageFn);
        }
    }

    // 节点的对象内，一处还是多处修改，都触发一次变更事件/ 
    let subject = subjects[path];
    if (subject) {
        subject.next(messageFn({
            path: path,
            newRoot: newRoot,
            oldRoot: oldRoot
        }));
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


function applyNodeIndexedItem(node, path, index, updateFn) {

    let stack = [];

    // 形成更新栈
    for (let cur = forwardCursor(path); cur !== undefined; cur = cur.next()) {

        const name = cur.name;
        stack.push([node, name]);
        node = node.object.get(name);
    }


    const oldobj = node.object;
    const result = updateFn(oldobj, index); // result: {object, changeset}
    if (result.object === oldobj) {
        // 如果前后对象还是同一个，那么就没有任何变化
        return { changeset: [] };
    }

    // changeset: [change1, ..., {new:..., old:...}, ... ]
    for (const [idx, chg] of result.changeset) {
        if (chg.new === undefined && chg.old !== undefined) {
            // 如果删除DNode，该node的successors为[]，表示已删除，没有后继
            const deleted = chg.old;
            if (deleted instanceof DNode) {
                deleted.successors = [];
            }
        }
    }

    // 对象的值已经发生改变
    let newnode = new node.constructor(result.object);
    newnode.succeed(node);

    let changeset = result.changeset;
    let idx = stack.length - 1;
    // idx -= 1;

    while (idx >= 0) {
        const [node, index] = stack[idx];

        const newobj = node.object.set(index, newnode); // set new child node
        newnode = new node.constructor(newobj);
        newnode.succeed(node);

        changeset = [
            [index, changeset]
        ];

        idx -= 1;
    }

    return {
        newRoot: newnode,
        changeset: changeset
    };
}

function applyConeIndexedItem(cone, path, index, updateFn) {
    const root = cone.root;
    const result = applyNodeIndexedItem(root, path, index, updateFn);

    if (result.newRoot !== undefined) { // root为undifined表示没有变化
        result.oldRoot = root;
        cone.root = result.newRoot;
    }

    return result;
}

function setConeIndexedItem(cone, path, index, value) {
    return applyConeIndexedItem(cone, path, index, (object, index) => {
        return {
            object: object.set(index, value),
            changeset: [
                [index, {
                    new: value,
                    old: object.get(index) // the deleted
                }]
            ]
        }

    });
}

function deleteConeIndexedItem(cone, path, index) {

    return applyConeIndexedItem(cone, path, index, (object, index) => {
        return {
            object: object.delete(index), // newobj after deleting
            changeset: [
                [index, {
                    old: object.get(index) // the deleted
                }]
            ]
        }

    });
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
    isIdenticalIn,
    pathJoin,
    _getValue,
    setConeIndexedItem,
    deleteConeIndexedItem,
    applyConeIndexedItem
};
