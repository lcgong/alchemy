import {
    Cone,
} from "../src/cone";

import { loadNodeFromJS } from "../src/jsobj";


import {
    removeConeListItem,
    unshiftConeListItem,
    pushConeListItem,
    popConeListItem,
    shiftConeListItem,
    clearConeList

} from "../src/coneList";


test("setValue", () => {
    let cone, cone1, change, cone2;

    cone1 = new Cone(loadNodeFromJS([
        10,
        { x: 20 },
        30,
        { x: 40 },
    ]));


    cone2 = cone1.branch();
    pushConeListItem(cone2, '', 50);

    console.log(cone2);

    cone2 = cone1.branch();
    change = clearConeList(cone2, '');

    console.log(cone2);
    console.log(change);
});
