import { loadNodeFromJS, exportNodetoJS } from "../src/jsobj";

test("load/export jsobj", () => {
    let cone, cone1, change, cone2;

    let jsobj, node;

    jsobj = {};
    node = loadNodeFromJS(jsobj);
    expect(exportNodetoJS(node)).toEqual(jsobj);

    jsobj = [];
    node = loadNodeFromJS(jsobj);
    expect(exportNodetoJS(node)).toEqual(jsobj);

    jsobj = [1, [],
        [10, 20]
    ];
    node = loadNodeFromJS(jsobj);
    expect(exportNodetoJS(node)).toEqual(jsobj);

    jsobj = { a: 100, b: { c: { x: 100 } } };
    node = loadNodeFromJS(jsobj);
    expect(exportNodetoJS(node)).toEqual(jsobj);

    jsobj = { a: [{ x: 1 }, 100] };
    node = loadNodeFromJS(jsobj);
    expect(exportNodetoJS(node)).toEqual(jsobj);
});
