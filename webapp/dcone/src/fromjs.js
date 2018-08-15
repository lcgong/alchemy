
import {
    createDObject
} from "./dobject";

import { Cone } from "../src/cone";

import {
    ImmutableMap,
    ImmutableList,
    isArrayObject,
    isPlainObject,
} from "./utils";

import {
    DNode, DObjectNode, DListNode
} from "./cone";


function fromJS(jsobj) {

    const root = buildNodeFromJS(jsobj);

    return createDObject(new Cone(root), root, root);
}

function buildNodeFromJS(jsobj) {
    return _fromJS('', jsobj)
}

function _fromJS(apath, value) {

    if (isPlainObject(value)) {

        let entries = [];
        for (let [k, v] of Object.entries(value)) {

            entries.push([k, _fromJS(apath + '.' + k, v)]);
        }

        return new DObjectNode(apath, ImmutableMap(entries));

    } else if (isArrayObject(value)) {

        let entries = [];
        let idx = 0;
        for (let v of value) {
            entries.push(_fromJS(apath + '#' + idx, v));
            idx += 1;
        }

        return new DListNode(apath, ImmutableList(entries));
    } else {
        return value;
    }
}


export {
    fromJS,
    buildNodeFromJS
};
