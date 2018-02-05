import {
    bisect_toggle,
    bisect_exists
} from './bisect';

it('bisect_toggle, bisect_exists', () => {

    let a = [];
    a = bisect_toggle(a, 0);
    expect(a).toEqual([0]);
    a = bisect_toggle(a, 0);
    expect(a).toEqual([]);
    

    a = bisect_toggle(a, 30);
    a = bisect_toggle(a, 10);
    a = bisect_toggle(a, 20);
    a = bisect_toggle(a, 15);
    a = bisect_toggle(a, 8);
    expect(a).toEqual([8, 10, 15, 20, 30]);

    expect(bisect_exists(a, 15)).toBeTruthy();
    expect(bisect_exists(a, 23)).toBeFalsy();

    a = bisect_toggle(a, 15);
    expect(a).toEqual([8, 10, 20, 30]);

    a = bisect_toggle(a, 11);
    expect(a).toEqual([8, 10, 11, 20, 30]);

    a = bisect_toggle(a, 20)
    expect(a).toEqual([8, 10, 11, 30]);
});
