//

function createTagNode(tag, attrs, ...contents) {
    if (!attrs) {
        return [tag, null, ...contents];
    } else {
        return [tag, attrs, ...contents];
    }
}

const TAG_TREE_RULES = {
    "image": function(token, attrs, children, nesting) {
        if (children.length) {
            attrs = {
                ...attrs,
                alt: children[0]
            };
        }

        return [
            createTagNode(token.tag, attrs)
        ];
    },

    "code_inline": function(token, attrs, children, nesting) {
        return [
            createTagNode(token.tag, attrs, token.content)
        ];
    },

    "code_block": function(token, attrs) {

        return [
            createTagNode('pre', null,
                createTagNode(token.tag, attrs, token.content)
            )
        ];
    },

    "fence": function(token, attrs, children, nesting) {
        if (token.info) {
            const langName = token.info.trim().split(/\s+/g)[0];
            if (attrs) {
                attrs = {
                    ...attrs,
                    'data-language': langName
                }
            } else {
                attrs = {
                    'data-language': langName
                }
            }
        }

        return [
            createTagNode('pre', null,
                createTagNode(token.tag, attrs, token.content)
            )
        ];
    },

    "hardbreak": function(token, attrs, children, nesting) {
        return [createTagNode('br')];
    },

    "softbreak": function(token, attrs, children, nesting) {
        return ['\n'];
    },

    "text": function(token, attrs, children, nesting) {
        return [token.content];
    },

    "html_block": function(token, attrs, children, nesting) {
        return [token.content];
    },

    "html_inline": function(token, attrs, children, nesting) {
        return [token.content];
    },

    "inline": function(token, attrs, children, nesting) {
        return children;
    },
};

// [tagName, attrs, ...contents]
function transformTagTree(tokens, tokenStart) {

    let nodes = [];

    let tokenEnd = tokens.length;
    let idx = tokenStart;
    while (idx < tokenEnd) {
        const token = tokens[idx];

        if (token.nesting === -1) {
            idx++;
            break;
        }

        let attrs = null;
        if (Array.isArray(token.attrs)) { // zip attrs object ordered by name
            attrs = token.attrs
                .sort((a, b) => a[0].localeCompare(b[0]))
                .reduce((a, [k, v]) => {
                    a[k] = v;
                    return a;
                }, {});
        }

        let nextIdx = null;
        let childrenNodes = null;
        if (token.children) {
            [, childrenNodes] = transformTagTree(token.children, 0);
        }

        let nestingNodes;
        if (token.nesting === 1) {
            [nextIdx, nestingNodes] = transformTagTree(tokens, idx + 1);
        } else {
            nestingNodes = [];
        }


        let rule = TAG_TREE_RULES[token.type];
        if (rule) {
            let r = rule(token, attrs, childrenNodes, nestingNodes);
            nodes = nodes.concat(r);

        } else {
            // default transform rule

            if (!token.tag) {
                nodes = nodes.concat([token.content]);
            } else {
                if (token.info) {
                    attrs = {
                        ...attrs,
                        'data-info': token.info.trim()
                    };
                }

                nodes = nodes.concat([
                    createTagNode(token.tag, attrs, ...nestingNodes)
                ]);
            }
        }

        idx = (nextIdx != null) ? nextIdx : idx + 1;
    }

    return [idx, nodes];
}


function normalize(tree, ctx) {
    // 1. 标记blank的index;
    //
    let tag = tree[0];
    let attrs = tree[1] || {};

    if (tag === 'question') {
        ctx.part = 0;
        ctx.blanks.push({});
        ctx.selects.push(null);

    } else if (tag === 'subquestion') {
        ctx.part++;
        ctx.blanks.push({});
        ctx.selects.push(null);

    } else if (tag === 'question-blank') {
        let partBlanks = ctx.blanks[ctx.part];

        if (ctx.part === 0) {
            partBlanks[attrs.no] = attrs;

            attrs.idx = ctx.blankIndex;
            ctx.blankIndex++;
        } else {
            if (attrs.no in ctx.blanks[0]) {
                // 在主题干中题空已经存在，使用主题干的定义
                partBlanks[attrs.no] = ctx.blanks[0][attrs.no];

            } else {
                partBlanks[attrs.no] = attrs;
                attrs.idx = ctx.blankIndex;
                ctx.blankIndex++;

                // 将在子题干中发现的新blank登记在主题干中，
                // 在主题干中应该包含所有出现的题干，即使实际上是个空的题干
                ctx.blanks[0][attrs.no] = attrs;
            }
        }

    } else if (tag === 'question-select') {
        if (!tree[1]) {
            tree[1] = attrs;
        }

        attrs.blanks = [];
        attrs.idx = ctx.selectIndex;

        ctx.selects[ctx.part] = attrs;

        ctx.optionIndex = 0;
    } else if (tag === 'question-option') {
        attrs.idx = ctx.optionIndex;
        ctx.optionIndex++;
    }

    for (let idx = 2; idx < tree.length; idx++) {
        const node = tree[idx];

        if (Array.isArray(node)) {
            normalize(node, ctx);
        }
    }

    // Tag结尾处理
    if (tag === 'subquestion') {
        //
    } else if (tag === 'question') {
        bindBlankSelect(ctx);

        for (let part = 1; part < ctx.blanks.length; part++) {
            let partBlankAttrs = ctx.blanks[part];
            if (Object.keys(partBlankAttrs).length === 0) {
                // select没有明确指定題空

                // 找出还未指定选择的题空，按照题号从小到大
                let candidates = Object.values(ctx.blanks[0]).filter(
                    (blankAttrs) => typeof blankAttrs.select === 'undefined'
                ).sort((a, b) => a.no.localeCompare(b.no));

                let blankAttrs = candidates[0];
                if (blankAttrs) {
                    partBlankAttrs[blankAttrs.no] = blankAttrs;

                    blankAttrs.select = ctx.selects[part].idx;
                    ctx.selects[part].blanks.push(blankAttrs.idx);
                }
            }
        }

        // console.log(33211, Object.values(ctx.blanks[0]));
        // 设置题空与选择题选项的对应关系
        attrs.blankSelect = Object.values(ctx.blanks[0]).reduce(
            (a, blank) => {
                a[blank.idx] = blank.select;
                return a;
            }, {});

        attrs.blankCount = ctx.blankIndex;
        attrs.selectCount = ctx.selectIndex;
        attrs.optionCount = ctx.optionCount;
    } else if (tag === 'question-select') {
        ctx.optionCount[ctx.selectIndex] = ctx.optionIndex; // 各选项板的选项数量
        ctx.selectIndex++;
    }
}

function bindBlankSelect(ctx) {
    // 绑定选择与题空的关系

    for (let part = 0; part < ctx.blanks.length; part++) {
        let selectAttrs = ctx.selects[part];
        if (selectAttrs) {
            for (let blankAttrs of Object.values(ctx.blanks[part])) {
                if (typeof blankAttrs.select === 'undefined') {
                    blankAttrs.select = selectAttrs.idx;
                    selectAttrs.blanks.push(blankAttrs.idx);
                }
            }
        }
    }
}

export function buildTagTree(tokens) {
    let trees;
    [, trees] = transformTagTree(tokens, 0);

    for (let tree of trees) {
        const ctx = {
            blankIndex: 0,
            selectIndex: 0,
            optionIndex: 0,
            optionCount: [], // 每个选项板内选项的数量
            part: 0, // 主题干0, 子题干1, 子题干2, ... 
            blanks: [], // [part0, {blankNon:blankAttrs}, part2, ... ]
            selects: [], // QuestionSelect
        };
        normalize(tree, ctx);
        // console.log('Ctx:\n' + JSON.stringify(ctx, null, '  '));
        console.log(tree);
    }

    return trees;
}
