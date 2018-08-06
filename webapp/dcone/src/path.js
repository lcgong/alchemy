
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

        this._pre = this._pos;
        this._pos = pos;

        return this;
    }

 }

function forwardCursor(obpath) {
    return new PathForwardCursor(obpath).next()
}

function forwardName(path, name) {
    return (path.length === 0) ? name : path + '.' + name;
}

function forwardIndex(path, index) {
    return (path.length === 0) ? name : path + '#' + name;
}

export {
    PathForwardCursor,
    forwardCursor
};