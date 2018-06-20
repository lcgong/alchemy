import React from 'react';


export function componentFactory(mapTagComp) {

    const _createComponent = (tree, level = 0, index = 0) => {
        // 遍历tag tree，将tag转换成component

        let tag = tree[0];
        const props = {
            key: `qmd-${tag}-${index}`
        };

        let attrs = tree[1];
        if (attrs) {
            Object.assign(props, attrs);
        }

        let children = [];
        for (let idx = 2; idx < tree.length; idx++) {
            const branch = tree[idx];

            if (Array.isArray(branch)) {
                children.push(_createComponent(branch, level + 1, idx));
            } else {
                children.push(branch);
            }
        }

        if (!children.length) {
            children = undefined;
        }

        return React.createElement(mapTagComp[tag] || tag, props, children);
    }

    return _createComponent;
}
