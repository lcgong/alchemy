function padding(length) {
    return ' '.repeat(length)
}

function formatToken(index, {
    type,
    tag,
    block,
    markup,
    level,
    nesting,
    map,
    attrs,
    info,
    meta,
    content,
    children,
    hidden,
}, indentationLevel = 0) {

    tag = (tag) ? ' <' + tag + '>' : tag;
    block = (block) ? 'BLOCK' : 'INLINE';
    hidden = (hidden) ? `:HIDDEN` : '';
    markup = (markup) ? ` '${markup}'` : '';
    map = (map) ? ` map[${map}]` : '';

    let lines = [];
    lines.push(`${block}${hidden}[${type}]${tag}${markup}` +
        ` Level:${level} Nesting:${nesting}${map}`);

    if (attrs) {
        lines.push(`ATTR: ${JSON.stringify(attrs)}`);
    }

    if (info) {
        lines.push(`INFO: ${JSON.stringify(info)}`);
    }

    if (meta) {
        lines.push(`META: ${JSON.stringify(meta)}`);
    }

    let numberMarker = '#' + index.toString().padStart(2, '0') + ' ';
    let indentation;

    if (content) {
        let buffers = content.split('\n');

        indentation = padding(numberMarker.length + 9);

        buffers = [buffers[0],
            ...buffers.slice(1).map((s) => indentation + s + '\n')
        ];
        lines.push(`CONTENT: ${buffers.join('\n')}`);
    }

    indentation = padding(indentationLevel * 4);
    let buffers = [indentation + numberMarker + lines[0]];

    indentation = padding(numberMarker.length + indentationLevel * 4);
    buffers = buffers.concat(
        lines.slice(1).map((ln) => (indentation + ln))
    );

    return buffers.join('\n');
}


export function formatTokens(tokens, indentationLevel = 0) {

    const blocks = [];

    for (let idx = 0; idx < tokens.length; idx++) {
        const token = tokens[idx];

        blocks.push(formatToken(idx, token, indentationLevel));
        if (token.children) {
            blocks.push(formatTokens(token.children, indentationLevel + 1));
        }
    }

    return blocks.join('\n\n');
}
