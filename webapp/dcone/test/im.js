import Immutable from "immutable/dist/immutable";

import { Subject } from "rxjs";



test("im", () => {

    var subject = new Subject();

    // subject.subscribe({
    //     next: (v) => console.log('observerA: ' + v)
    // });

    // subject.subscribe((x)=>{
    //     console.log('aaa: ', x);
    // });


    subject.next(1);

    subject.subscribe({
        next: (v) => console.log('observerB: ' + v)
    });

    subject.next(2);

    subject.complete();

    // let obj;

    // obj = Immutable.fromJS({ a: 1 });

    // console.log(obj);

    // let x = {};

    // let a1 = obj.set('b', x);
    // let a2 = a1.set('b', x);

    // console.log(a1 === a2, a1, a2);

});
