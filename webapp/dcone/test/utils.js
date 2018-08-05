import {
    formatPathParts,
    parsePathParts,
    forwardName,
    forwardIndex,
    PathCursor
} from "../src/path";

test("format path", () => {

    expect(formatPathParts([])).toBe('');
    expect(formatPathParts(['a'])).toBe('a');
    expect(formatPathParts([-1])).toBe('[-1]');
    expect(formatPathParts([1, 2, 3])).toBe('[1][2][3]');
    expect(formatPathParts(['a', 'b', 'c'])).toBe('a.b.c');
    expect(formatPathParts(['a', 'b', 1, 0, 'c'])).toBe('a.b[1][0].c');
});


test("parse path parts", () => {
    expect(parsePathParts('')).toEqual([]);
    expect(parsePathParts('a')).toEqual(['a']);
    expect(parsePathParts('a.b')).toEqual(['a', 'b']);

    expect(parsePathParts('[0]')).toEqual([0]);
    expect(parsePathParts('[0][1]')).toEqual([0, 1]);
    expect(parsePathParts('a[0][1]')).toEqual(['a', 0, 1]);
    expect(parsePathParts('a[0][1].c')).toEqual(['a', 0, 1, 'c']);
});

test("forward", () => {

    expect(forwardName('', 'a')).toBe('a');
    expect(forwardName('a', 'b')).toBe('a.b');

    expect(forwardIndex('', 1)).toBe('[1]');
    expect(forwardIndex('a', 1)).toBe('a[1]');
});

test("shift", () => {

    let shifter;
    
    shifter = PathCursor.of('');
    expect(shifter.current).toBe('');
    expect(shifter.postfix).toBe('');
    expect(shifter.prefix).toBe('');
    
    shifter = PathCursor.of('a');
    expect(shifter.prefix).toBe('');
    expect(shifter.postfix).toBe('');
    expect(shifter.current).toBe('a');
    expect(shifter.shift()).toBe(null);

    shifter = PathCursor.of('a.b.c');
    expect(shifter.prefix).toBe('');
    expect(shifter.current).toBe('a');
    expect(shifter.postfix).toBe('b.c');
    shifter = shifter.shift();
    expect(shifter.prefix).toBe('a');
    expect(shifter.current).toBe('b');
    expect(shifter.postfix).toBe('c');
    shifter = shifter.shift();
    expect(shifter.prefix).toBe('a.b');
    expect(shifter.current).toBe('c');
    expect(shifter.postfix).toBe('');    

    expect(PathCursor.of('a.b.c').shift().shift().current).toBe('c');
    expect(PathCursor.of('a.b[1]').current).toBe('a');
    expect(PathCursor.of('a.b[1]').shift().current).toBe('b');
    expect(PathCursor.of('a.b[1]').shift().shift().current).toBe(1);
    expect(PathCursor.of('a.b[1]').shift().shift().prefix).toBe('a.b');

    expect(PathCursor.of('[1][2].c').current).toBe(1);
    expect(PathCursor.of('[1][2].c').shift().current).toBe(2);
    expect(PathCursor.of('[1][2].c').shift().shift().current).toBe('c');
    expect(PathCursor.of('[1][2].c').shift().shift().prefix).toBe('[1][2]');

    expect(PathCursor.of('').shift()).toBe(null);
    expect(PathCursor.of('').shift()).toBe(null);
    expect(PathCursor.of('a').shift()).toBe(null);
});