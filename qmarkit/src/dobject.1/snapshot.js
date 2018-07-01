/*jshint esversion: 6 */

import { DObject, makeObject } from "./dobject";

function snapshot(dobj) {
    if (!(dobj instanceof DObject)) {
        throw new TypeError('should be a object pf DObject or DList');
    }

    let { coneID, root } = dobj.__cone;

    return new Snapshot(coneID, root, [...dobj.__path])
}

class Snapshot {

    constructor(coneID, root, path) {
        this.__coneID = coneID;
        this.__root = root;
        this.__path = path;
        this.__object = null;
    }

    get object() {
        if (this.__object === null) {
            const cone = {
                coneID: this.__coneID,
                root: this.__root,
            };
            this.__object = makeObject(cone, this.__path);
        }

        return this.__object;
    }

    /**
     * 判定快照对象与给定的对象或快照是否同一个。
     * 
     * @param {*} another a object of DSnapshot, DObject or DList.
     */
    isSameAs(another) {

        let anotherRoot, anotherPath;

        if (another instanceof Snapshot) {
            anotherRoot = this.__root;
            anotherPath = another.__path;

        } else if (another instanceof DObject) {
            anotherRoot = another.__cone.root;
            anotherPath = another.__path;

        } else {
            let err = 'Should be a object of Snapshot, DObject or DList';
            throw new TypeError(err);
        }

        let thisImmutable = this.__root.getIn(this.__path);
        let anotImmutable = anotherRoot.getIn(anotherPath);

        return thisImmutable == anotImmutable;
    }
}

export { snapshot };
