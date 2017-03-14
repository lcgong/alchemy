
export function printBlockTokenState(title: string, state: any, startLine: number, endLine: number) {
  if (endLine === undefined) {
    endLine = startLine + 1;
  }

  var lines = [title,
    'state.line=', state.line.toString(),
    ', blkIndent=', state.blkIndent.toString(), '; \n'
  ];

  for (var ln = startLine; ln < endLine; ln++) {
    lines.splice(lines.length, 0,
      title, 'ln=', ln,
      ', beMarks=', state.bMarks[ln].toString(),
      ':', state.eMarks[ln].toString(),
      ', tShift=', state.tShift[ln].toString(),
      ', sCount=', state.sCount[ln].toString(),
      '\n>>', state.src.slice(state.bMarks[ln], state.eMarks[ln]), '\n\n');
  }

  console.log(lines.join(''));
}
