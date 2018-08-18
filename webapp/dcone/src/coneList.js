import { applyConeIndexedItem } from "./cone";


function insertConeListItem(cone, path, index, value) {

    return applyConeIndexedItem(cone, path, index, (object, index) => {

        const newobj = object.insert(index, value);
        return {
            object: newobj,
            changeset: [
                [index, {
                    new: value,
                }]
            ]
        }
    });
}

function removeConeListItem(cone, path, index) {

    return applyConeIndexedItem(cone, path, index, (object, index) => {

        const oldval = object.get(index);
        const newobj = object.remove(index);

        return {
            object: newobj,
            changeset: [
                [index, {
                    old: oldval
                }]
            ]
        }
    });
}


function clearConeList(cone, path) {

    return applyConeIndexedItem(cone, path, null, (object, index) => {
        const changeset = [];

        for (let idx = 0, n = object.size; idx < n; idx++) {
            changeset.push([idx, { old: object.get(idx) }]);
        }

        const newobj = object.clear();

        return {
            object: newobj,
            changeset: changeset
        }
    });
}


function unshiftConeListItem(cone, path, values) {


    return applyConeIndexedItem(cone, path, null, (object, index) => {
        const changeset = [];
        let newidx = 0;
        for (let value of values) {
            changeset.push([newidx, { new: value }]);
            newidx += 1;
        }

        const newobj = object.unshift(...values);
        
        return {
            object: newobj,
            changeset: changeset
        }
    });
}

function shiftConeListItem(cone, path) {

    return applyConeIndexedItem(cone, path, null, (object, index) => {

        const oldval = object.first();
        const newobj = object.shift();
        return {
            object: newobj,
            changeset: [
                [0, {
                    old: oldval,
                }]
            ]
        }
    });
}


function pushConeListItem(cone, path, values) {

    return applyConeIndexedItem(cone, path, null, (object, index) => {
        const changeset = [];

        let newidx = object.count();
        for (let value of values) {
            changeset.push([newidx, { new: value }]);
            newidx += 1;
        }

        const newobj = object.push(...values);
        return {
            object: newobj,
            changeset: changeset
        }
    });
}

function popConeListItem(cone, path) {

    return applyConeIndexedItem(cone, path, null, (object, index) => {

        const oldval = object.last();
        const oldidx = object.count() - 1;
        const newobj = object.pop();

        return {
            object: newobj,
            changeset: [
                [oldidx, {
                    old: oldval,
                }]
            ]
        }
    });
}


export {
    insertConeListItem,
    removeConeListItem,
    clearConeList,
    unshiftConeListItem,
    pushConeListItem,
    popConeListItem,
    shiftConeListItem,

};
