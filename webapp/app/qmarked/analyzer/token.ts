
export class TokenSection {
  constructor(public tokens: any[],
              public bgnIndex: number,
              public endIndex: number) {
  }

  get first() {
    return this.tokens[this.bgnIndex];
  }

  get last() {
    return this.tokens[this.endIndex];
  }

  index(idx: number) {
    return this.tokens[this.bgnIndex + idx];
  }

  get(index: number) {
    return this.tokens[index];
  }

  new(bgnIndex: number, endIndex: number) {
    return new TokenSection(this.tokens, bgnIndex, endIndex);
  }
}

/** 遍历tokens找出name的<name>_open和<name>_open的范围*/
export function* findTokenSections(name: string, tokenSection: TokenSection, recursive = false) {

  let openTagName = name + '_open';
  let closeTagName = name + '_close';

  let lastBgnIdx, lastEndIdx;

  let bgnIndex = tokenSection.bgnIndex;
  let endIndex = tokenSection.endIndex;

  for (let idx = bgnIndex; idx <= endIndex; idx++) {

    let token = tokenSection.get(idx);

    if (recursive && token.children) {
      let tokens = token.children;
      let section = new TokenSection(tokens, 0, tokens.length - 1);

      for (section of findTokenSections(name, section, recursive)) {
        yield section;
      }
    }

    if (token.type == openTagName) {
      lastBgnIdx = idx;

    } else if (token.type == closeTagName) {
      lastEndIdx = idx;

      yield tokenSection.new(lastBgnIdx, lastEndIdx);
    }
  }
}
