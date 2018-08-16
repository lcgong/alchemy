//

import { snapshot } from "./snapshot";

import {
    DObject,
    DList,
    branch,
    createDObject,
    DObjectCone
} from "./dobject";

import { loadNodeFromJS } from "./jsobj";
import { keys } from "./utils";


function fromJS(jsobj) {

    const root = loadNodeFromJS(jsobj);
    return createDObject(new DObjectCone(root), root, '', root);
}


export default {
    fromJS,
    DObject,
    DList,
    snapshot,
    branch,
    keys
};

// export { fromJS, DObject, DList, snapshot, keys };
