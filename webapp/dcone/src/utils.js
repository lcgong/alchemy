/*jshint esversion: 6 */

import { Map, List, Collection } from "immutable/dist/immutable";
import Immutable from "immutable/dist/immutable";

const isArrayObject = Array.isArray;

const isPlainObject = function(v) {
    return (v && (v.constructor === Object || v.constructor === undefined));
};

const isImmutable = Immutable.Iterable.isIterable;

const isImmutableMap = Immutable.Map.isMap;

const isImmutableList = Immutable.List.isList;

const ImmutableMap = Immutable.Map;

const ImmutableList = Immutable.List;

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
const NOT_SET_VALUE = {};


// A function which returns a value representing an unique ID for a cone.
function ConeID() {}



function formatSignature(path) {

    const iter = path[Symbol.iterator]();

    let part = iter.next();
    if (part.done) {
        return '';
    }

    const parts = [];
    const value = part.value;
    if (Number.isInteger(value)) {
        parts.push(`[${value}]`);
    } else {
        parts.push(value);
    }

    for (part = iter.next(); !part.done; part = iter.next()) {
        const value = part.value;
        if (Number.isInteger(value)) {
            parts.push(`[${value}]`);
        } else {
            parts.push('.');
            parts.push(value);
        }
    }

    return parts.join('');
}

function parseSignature(signature) {
    const len = signature.length;

    let parts = [],
        pos = 0,
        ch = null,
        bgn = 0;

    while (pos < len) {
        ch = signature.charAt(pos);

        if (ch === '.') {
            if (bgn < pos) {
                parts.push(signature.slice(bgn, pos));
            }
            pos++;
            bgn = pos;

            continue;
        }

        if (ch === '[') {
            if (bgn < pos) {
                parts.push(signature.slice(bgn, pos));
            }
            pos++;
            bgn = pos;

            for (; pos < len && signature.charAt(pos) !== ']'; pos++);

            if (bgn < pos) {
                parts.push(parseInt(signature.slice(bgn, pos)));
            }
            pos++;
            bgn = pos;

            continue;
        }

        pos++;
    }

    if (bgn < pos) {
        parts.push(signature.slice(bgn, pos));
    }

    return parts;
}

export {
    ImmutableMap,
    ImmutableList,
    isArrayObject,
    isPlainObject,
    isImmutable,
    isImmutableMap,
    isImmutableList,
    formatSignature,
    parseSignature,
    NOT_SET_VALUE,
    ConeID
};
