
/**
 * '' 根对象
 * '.a' 对象的属性为a的对象
 * '#1' 列表中下标为1的对象
 * 
 */


 class PathForwardCursor {

    constructor(path) {
        this._path = path;
        this._pos = 0;  
        this._pre = -1; // previous seperator position
    }

    get path() {
        if (this._pre === -1) {
            return; // root
        }

        return this._path.slice(0, this._pos);
    }

    get name() {
        if (this._pre === -1) {
            return;
        }

        return this._path.slice(this._pre + 1, this._pos);
    }

    next() {
        const path = this._path;
        const len = this._path.length;
        let pos = this._pos;

        if (pos >= len) {
            return;
        }

        pos += 1; // skip current seperator '.' or '#'

        while (pos < len) {
            const ch = path.charAt(pos);
            if (ch === '.' || ch === '#') {
                break;
            }

            pos++;
        }

        const cursor = new PathForwardCursor(this._path);
        cursor._pre = this._pos;
        cursor._pos = pos;
        return cursor;
    }

 }

function forwardName(path, name) {
    return (path.length === 0) ? name : path + '.' + name;
}

function forwardIndex(path, index) {
    return (path.length === 0) ? name : path + '#' + name;
}

// class PathCursor {
//     constructor(path, pos) {
//         this.path = path;
//         this.pos = pos || 0;
//         this.nextPos = null;
//     }

//     static of (path) {
//         return new PathCursor(path, 0);
//     }

//     get prefix() {
//         const path = this.path;
//         const pos = this.pos;

//         if (path.charAt(pos - 1) === '.') {
//             return path.slice(0, pos - 1);
//         } else {
//             return path.slice(0, pos);
//         }
//     }

//     get postfix() {
//         if (this.nextPos === null) {
//             this.current;
//         }
//         return this.path.slice(this.nextPos);
//     }

//     get current() {
//         const path = this.path;
//         const len = path.length;
//         const bgn = this.pos;
//         let pos = this.pos,
//             ch = null;

//         if (path.charAt(pos) === '[') {

//             pos += 1;
//             for (; pos < len && path.charAt(pos) !== ']'; pos++);

//             if (path.charAt(pos + 1) === '.') { // similar with [1].c
//                 this.nextPos = pos + 2;
//             } else {
//                 this.nextPos = pos + 1;
//             }

//             return parseInt(path.slice(bgn + 1, pos));
//         }

//         while (pos < len) {
//             ch = path.charAt(pos);

//             if (ch === '.') {
//                 this.nextPos = pos + 1;
//                 return path.slice(bgn, pos);
//             }

//             if (ch === '[') {
//                 this.nextPos = pos;
//                 return path.slice(bgn, pos);
//             }

//             pos++;
//         }

//         this.nextPos = len;

//         return path.slice(bgn, len);
//     }

//     shift() {
//         if (this.nextPos == null) {
//             this.current // force to get the nextPos
//         }

//         if (this.nextPos >= this.path.length) {
//             return null;
//         }

//         return new PathCursor(this.path, this.nextPos);
//     }
// }


// function formatPathParts(pathParts) {

//     const iter = pathParts[Symbol.iterator]();

//     let part = iter.next();
//     if (part.done) {
//         return '';
//     }

//     const parts = [];
//     const value = part.value;
//     if (Number.isInteger(value)) {
//         parts.push(`[${value}]`);
//     } else {
//         parts.push(value);
//     }

//     for (part = iter.next(); !part.done; part = iter.next()) {
//         const value = part.value;
//         if (Number.isInteger(value)) {
//             parts.push(`[${value}]`);
//         } else {
//             parts.push('.');
//             parts.push(value);
//         }
//     }

//     return parts.join('');
// }

// function parsePathParts(signature) {
//     const len = signature.length;

//     let parts = [],
//         pos = 0,
//         ch = null,
//         bgn = 0;

//     while (pos < len) {
//         ch = signature.charAt(pos);

//         if (ch === '.') {
//             if (bgn < pos) {
//                 parts.push(signature.slice(bgn, pos));
//             }
//             pos++;
//             bgn = pos;

//             continue;
//         }

//         if (ch === '[') {
//             if (bgn < pos) {
//                 parts.push(signature.slice(bgn, pos));
//             }
//             pos++;
//             bgn = pos;

//             for (; pos < len && signature.charAt(pos) !== ']'; pos++);

//             if (bgn < pos) {
//                 parts.push(parseInt(signature.slice(bgn, pos)));
//             }
//             pos++;
//             bgn = pos;

//             continue;
//         }

//         pos++;
//     }

//     if (bgn < pos) {
//         parts.push(signature.slice(bgn, pos));
//     }

//     return parts;
// }

// export {
//     parsePathParts,
//     formatPathParts,
//     forwardIndex,
//     forwardName,
//     PathCursor
// };

export {
    PathForwardCursor
};