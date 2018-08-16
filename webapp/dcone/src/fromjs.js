
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
    return _fromJS(jsobj)
}

function _fromJS(value) {

    if (isPlainObject(value)) {

        let entries = [];
        for (let [k, v] of Object.entries(value)) {

            entries.push([k, _fromJS(v)]);
        }

        return new DObjectNode(ImmutableMap(entries));

    } else if (isArrayObject(value)) {

        let entries = [];
        let idx = 0;
        for (let v of value) {
            entries.push(_fromJS(v));
            idx += 1;
        }

        return new DListNode(ImmutableList(entries));
    } else {
        return value;
    }
}


export {
    fromJS,
    buildNodeFromJS
};
