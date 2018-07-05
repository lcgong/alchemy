import Immutable from "immutable/dist/immutable";
import { formatSignature, parseSignature } from "../src/utils";

test("format path", () => {

    const fromJS = Immutable.fromJS;

    expect(formatSignature(fromJS([]))).toBe('');
    expect(formatSignature(fromJS(['a']))).toBe('a');
    expect(formatSignature(fromJS([-1]))).toBe('[-1]');
    expect(formatSignature(fromJS([1, 2, 3]))).toBe('[1][2][3]');
    expect(formatSignature(fromJS(['a', 'b', 'c']))).toBe('a.b.c');
    expect(formatSignature(fromJS(['a', 'b', 1, 0, 'c']))).toBe('a.b[1][0].c');
});


test("parse signature", () => {
    expect(parseSignature('')).toEqual([]);
    expect(parseSignature('a')).toEqual(['a']);
    expect(parseSignature('a.b')).toEqual(['a', 'b']);

    expect(parseSignature('[0]')).toEqual([0]);
    expect(parseSignature('[0][1]')).toEqual([0, 1]);
    expect(parseSignature('a[0][1]')).toEqual(['a', 0, 1]);
    expect(parseSignature('a[0][1].c')).toEqual(['a', 0, 1, 'c']);
})
