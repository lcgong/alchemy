/*jshint esversion: 6 */


import Immutable from "immutable/dist/immutable";
import { formatPath } from "../../dobject/utils";


test("format path", () => {

    const fromJS = Immutable.fromJS;

    expect(formatPath(fromJS([]))).toBe('');
    expect(formatPath(fromJS(['a']))).toBe('a');
    expect(formatPath(fromJS([-1]))).toBe('[-1]');
    expect(formatPath(fromJS([1, 2, 3]))).toBe('[1][2][3]');
    expect(formatPath(fromJS(['a', 'b', 'c']))).toBe('a.b.c');
    expect(formatPath(fromJS(['a', 'b', 1, 0, 'c']))).toBe('a.b[1][0].c');

});
