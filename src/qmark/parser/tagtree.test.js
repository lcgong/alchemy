import markdown from 'markdown-it';
import qmarkParser from '.';
import { formatTokens } from './debug';
import { buildTagTree } from './tagtree';


it('qmark parser', () => {
    let md = markdown();
    md.disable(['code'])
    md.use(qmarkParser);

    let tokens;
    let trees;

    tokens = md.parse(question2, {});
    trees = buildTagTree(tokens);

    console.log('TagTree:\n'+JSON.stringify(trees[0], null, '  '));

    // console.log('Meta:\n' + JSON.stringify(meta, null, '  '));

    // console.log(formatTokens(tokens));
    // console.log('TagTree:\n'+JSON.stringify(tree, null, '  '));

});

let question1 = `\
##1 单选题
为验证程序模块A是否正确实现了规定的 *功能* ，需要进行 __(1)__；
为验证模块A能否与其他模块按照规定方式正确工作，需要进行__(2)__。

(A): 单元测试
(B): 集成测试
(C): 确认测试
(D): 系统测试

%%% 答案 1. (A) ; 2. (B)
`;

let question2 = `\
##1 单选题
为验证程序模块A是否正确实现了规定的功能，需要进行 __(1)__；
为验证模块A能否与其他模块按照规定方式正确工作，需要进行__(2)__。

  ~~~python
  def f():
    a = 1
  ~~~

###1 单选题 一行四项
题目设计的过程__1(1)__,  另外 __1(3)__
  (A): 单元测试
  (B): 集成测试
  (C, 整行): 确认测试
  (D): 系统测试

  %%% 答案  (A)


###2 单选题 一行四项
子程序模块 
  (A): 单元测试
  (B): 集成测试
  (C): 确认测试
  (D): 系统测试

  %%% 答案：(B)
`;