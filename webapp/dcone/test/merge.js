import {
    Cone,
    setConeIndexedItem,
    deleteConeIndexedItem
} from "../src/cone";

import { diff, merge } from "../src/merge";
import { loadNodeFromJS } from "../src/jsobj";


test("setValue", () => {
    let cone, cone1, cone2, cone3;

    cone = new Cone(loadNodeFromJS({
        a: {
            b: { c: 100 },
            d: [1, 2, 3]
        },
        x: 123

    }));

    cone1 = cone.branch();
    cone2 = cone.branch();
    cone3 = cone.branch();

    // cone2.set('.a.b.c', 120);
    setConeIndexedItem(cone2, '.a.b', 'c', 120);
    // cone2.set('.y', 456);
    setConeIndexedItem(cone2, '', 'y', 456);
    // cone2.delete('.x');
    deleteConeIndexedItem(cone2, '', 'x');


    // cone3.set('.a.d#0', 456);
    setConeIndexedItem(cone2, '.a.d', 0, 456);


    let chgs;
    chgs = diff(cone2.root, cone1.root);
    console.log('changeset: ', JSON.stringify(chgs));

    console.log(cone3);
    merge(cone3, '', cone1, cone2, '')

});


test("case 2: list", () => {
    let cone, cone1, cone2, cone3;

    cone = new Cone(loadNodeFromJS({
        a: [1, { b: 10, c: 20 }, 3, 4]
    }));

    cone1 = cone.branch();
    cone2 = cone.branch();

    setConeIndexedItem(cone2, '.a#1', 'b', 15);

    let chgs;
    chgs = diff(cone2.root, cone1.root);
    expect(chgs.length).toBe(1);
    expect(chgs[0]).toEqual(["a", [
        [1, [
            ["b", { "new": 15, "old": 10 }]
        ]]
    ]]);

    console.log('changeset: ', JSON.stringify(chgs));

    cone3 = cone.branch();

    merge(cone3, '', cone1, cone2, '');
    expect(cone3.getValue('.a#1').object.toJS()).toEqual({ b: 15, c: 20 });

    console.log(cone3);

});
