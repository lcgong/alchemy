import React, { Component } from 'react';
import './App.scss';

import QmarkCard from './qmark/QmarkCard';
import './qmark/question.scss';
import './paper.scss';

import { createMarkdown, convertTree } from './qmark/parser';

// import PunchedHRuler from './PunchedHRuler';
// import PaperCard from './PaperCard';


class App extends Component {

  render() {
    const markdown = createMarkdown();
    const tagtrees = convertTree(markdown, questions[1]);

    return (
      <div className="App" >
        <div className="paper-card ripped">
          <QmarkCard model={tagtrees[0]} />
        </div>


        {/* <PaperCard>
          <PunchedHRuler  />
        </PaperCard> */}
        {/* <div className="paper-card">
          <div style={{ "height": "8em", "width": "100%", "backgroundColor": "white" }} >
          </div>

          <div style={{ "height": "8em", "width": "100%", "backgroundColor": "white" }} >
          </div>
        </div> */}

      </div >
    );
  }

}

export default App;


let questions = [
  //--------------------------------------------------------------------------
  `\
##1 单选题
为验证程序模块A是否正确实现了规定的 *功能* ，需要进行 __(1)__；
为验证模块A能否与其他模块按照规定方式正确工作，需要进行__(2)__。

(A): 单元测试
(B): 集成测试，能否与其他模块按，能否与其他模块按，能否与其他模块按，能否与其他模块按，能否与其他模块按，能否与其他模块按
(C): 确认测试
(D): 系统测试

%%% 答案 1. (A) ; 2. (B)
`,
  //-------------------------------------------------------------------------
  `\
##1 单选题
为验证程序模块A是否正确实现了规定的功能，需要进行 __(1)__；
为验证模块A能否与其他模块按照规定方式正确工作，需要进行__(2)__。

  ~~~python
  def f():
    a = 1
  ~~~

###1 单选题 一行四项
  (A): 单元测试
  (B): 集成测试集成测试，能否与其他模块按，能否与其他模块按，能否与其他模块按，能否与其他模块按，能否与其他模块按，能否与其他模块按
  (C, 整行): 确认测试
  (D): 系统测试

  %%% 答案  (A)

###2 单选题 一行四项
  (A): 单元测试
  (B): 集成测试
  (C): 确认测试
  (D): 系统测试

  %%% 答案：(B)
`
];
