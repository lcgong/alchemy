//

import { snapshot } from "./snapshot";

import {
    DObject,
    DList,
    branch,
    createDObject,
    DObjectCone,
    keys,
    size
} from "./dobject";

import {
    loadNodeFromJS,
    exportNodetoJS
} from "./jsobj";



function fromJS(jsobj) {

    const root = loadNodeFromJS(jsobj);
    return createDObject(new DObjectCone(root), root, '', root);
}

function toJS(dobj) {
    return exportNodetoJS(dobj.__stub.node);

}


export default {
    fromJS,
    toJS,
    DObject,
    DList,
    snapshot,
    branch,
    keys,
    size
};

// export { fromJS, DObject, DList, snapshot, keys };
