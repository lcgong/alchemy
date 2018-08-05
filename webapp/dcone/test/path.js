import { PathForwardCursor } from "../src/path";

test("path forward cursor", () => {
    let cur; 

    cur = new PathForwardCursor('.a.b');

    cur = cur.next();
    expect(cur.path).toBe('.a');
    expect(cur.name).toBe('a');

    cur = cur.next();
    expect(cur.path).toBe('.a.b');
    expect(cur.name).toBe('b');

    cur = cur.next();
    expect(cur).toBeUndefined();


    cur = new PathForwardCursor('#1#2');
    cur = cur.next();
    expect(cur.path).toBe('#1');
    expect(cur.name).toBe('1');

    cur = cur.next();
    expect(cur.path).toBe('#1#2');
    expect(cur.name).toBe('2');

    cur = new PathForwardCursor('');
    cur = cur.next();
    expect(cur).toBeUndefined();

});
