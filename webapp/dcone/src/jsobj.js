import {
    createDObject,
    DObjectCone
} from "./dobject";

import { Cone } from "../src/cone";

import {
    ImmutableMap,
    ImmutableList,
    isArrayObject,
    isPlainObject,
} from "./utils";

import {
    DNode,
    DObjectNode,
    DListNode
} from "./cone";


function loadNodeFromJS(jsobj) {
    if (isPlainObject(jsobj)) {

        let entries = [];
        for (let [k, v] of Object.entries(jsobj)) {

            entries.push([k, loadNodeFromJS(v)]);
        }

        return new DObjectNode(ImmutableMap(entries));

    } else if (isArrayObject(jsobj)) {

        let entries = [];
        let idx = 0;
        for (let v of jsobj) {
            entries.push(loadNodeFromJS(v));
            idx += 1;
        }

        return new DListNode(ImmutableList(entries));
    } else {
        return jsobj;
    }
}

function exportNodetoJS(node) {
    if (node instanceof DObjectNode) {

        let jsobj = {};
        for (let [name, item] of node.object.entries()) {

            if (item instanceof DNode) {
                item = exportNodetoJS(item);
            }

            jsobj[name] = item;
        }
        return jsobj;

    } else if (node instanceof DListNode) {

        let data = [];
        for (let item of node.object.values()) {
            if (item instanceof DNode) {
                item = exportNodetoJS(item);
            }
            data.push(item);
        }
        return data;
    }

    return node;
}

export {
    loadNodeFromJS,
    exportNodetoJS
};
