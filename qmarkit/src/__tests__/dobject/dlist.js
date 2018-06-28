/*jshint esversion: 6 */

import dobject from "../../dobject";


const numList = [10, 20, 30];

import Immutable from "immutable";

test("dobject get and set", () => {

    // console.log(Immutable.fromJS([12,13,14]));
    // return;
    let obj = dobject.fromJS(numList);

    // for (let i of obj) {
    //     console.log(i);
    // }

    // return;

    expect(obj[1]).toBe(20);
    expect(obj[9]).toBeUndefined();

    obj.push(40);
    expect(obj.__object).toBeUndefined(); // clear cache
    expect(obj[3]).toBe(40); // access to get and  cache
    expect(obj.__object).toBeDefined(); 

    obj[2] = obj[2] + 5;
    expect(obj[2]).toBe(35);


    // for (let i of obj) {
    //     console.log(i);
    // }
    
    console.log(obj);
});
