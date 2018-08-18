import Immutable from "immutable/dist/immutable";

import { Subject } from "rxjs";



test("diff a list", () => {
    let objs = Immutable.List([10,20,30,40]);

    console.log([...objs]);

    let iter = objs[Symbol.iterator]();
    console.log(iter.next());
});
