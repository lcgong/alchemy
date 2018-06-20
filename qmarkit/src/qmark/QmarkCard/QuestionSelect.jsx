import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { bisect_exists } from '../bisect';
import QuestionOption from './QuestionOption';
import { checkOption, focusBlank, unspecifiedBlank } from './redux';


function mapOptionChildren(children, propsFunc) {
  // 给各child组件添加属性
  return React.Children.map(children, (child) => (
    (child.type !== QuestionOption)
      ? child
      : React.cloneElement(child, propsFunc(child))
  ));
}


class QuestionSelect extends Component {

  static contextTypes = {
    store: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    this.setState({
      columnCount: 1,
      activeBlank: -1,
      answer: null
    });
  }

  componentDidMount() {
    const { store } = this.context;

    this.unsubscribe = store.subscribe(() => {

      const storeState = store.getState();
      const thisState = this.state;

      const selectActive = storeState.selects[this.props.idx];
      const activeBlank = (selectActive) ? storeState.blankIdx : -1;
      const focusOption = (selectActive) ? storeState.focusOption : -1;

      let answer;
      if (activeBlank !== -1) {
        answer = storeState.answer[activeBlank];
      } else {
        if (this.props.blanks.length === 1) {
          answer = storeState.answer[this.props.blanks[0]];
        } else {
          answer = null;
        }
      }

      if (thisState.answer !== answer
        || thisState.activeBlank !== activeBlank
        || thisState.selectActive !== selectActive
        || thisState.focusOption !== focusOption) {

        this.setState({
          ...this.state,
          activeBlank,
          selectActive,
          focusOption,
          answer
        });
      }
    });

    this.adjustColumnSize();
  }

  adjustColumnSize() {
    const getDimension = (c) => {
      let node = findDOMNode(c);
      return { w: node.offsetWidth, h: node.offsetHeight };
    }

    const selectDim = getDimension(this);
    const optionDims = Object.values(this.refs)
      .filter(c => c instanceof QuestionOption)
      .map(c => getDimension(c));

    if (optionDims.length === 0) {
      return;
    }

    const capacity = selectDim.w / Math.max(...optionDims.map(x => x.w));
    if (capacity >= 4) {
      this.setState({
        ...this.state,
        columnCount: 4
      });

    } else if (capacity >= 1.8) {
      this.setState({
        ...this.state,
        columnCount: 2
      });

    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleClick(evt) {

    const { store } = this.context;
    const { activeBlank } = this.state;
    const { blanks, idx } = this.props;

    if (activeBlank !== -1) {
      //  如果题空已经选择，那么选项板也已选择
      evt.stopPropagation();
      return;
    }

    // console.log('clicked', activeBlank, this.props.blanks.length);

    if (this.props.blanks.length === 1) {
      // 在先选择选项板时，如果只有一个题空，则自动选择题空

      store.dispatch(focusBlank(blanks[0], idx));
      evt.stopPropagation();

    } else {
      // 先选择选项板，但有多个题空，无法判断那个题空，因此选项板进入未确定题空的状态
      evt.stopPropagation();
      store.dispatch(unspecifiedBlank(blanks, idx));
    }

  }

  render() {
    const { dispatch } = this.context.store;
    const selectIdx = this.props.idx; // 选项板的索引号
    const { blanks } = this.props;
    const {
      selectActive, activeBlank, answer, columnCount, focusOption
    } = this.state;

    const classnames = [
      'question-select',
      selectActive === 1 && 'active',
      selectActive === -1 && 'unspecified',
      columnCount === 2 && 'select-2-cols', // 选项两列显示
      columnCount === 4 && 'select-4-cols', // 选项四列显示
    ].filter(Boolean).join(' ');


    let children = mapOptionChildren(this.props.children,
      (child) => {
        const optionIdx = child.props.idx;
        const optionProps = {
          ref: `opt-${optionIdx}`, // 用于获得DOM节点的引用
          checked: bisect_exists(answer, optionIdx), // 是否涂填该选项
          focus: focusOption === optionIdx, // 是否在选择中获得了键盘焦点
        };

        if (blanks.length === 1) { // 本选项板对应题空的数量
          // 如果选项板只对应一个题空时，即使选项板没有激活，自动激活选项板并涂填本选项
          optionProps.onClick = (evt) => { // 鼠标点击选线，涂填选项
            evt.stopPropagation();
            console.log('select:', activeBlank, selectIdx, optionIdx);

            dispatch(checkOption(selectIdx, optionIdx));
          };
        } else if (activeBlank !== -1) { // 有确定的题空（对应多题空的选项板）
          dispatch(checkOption(selectIdx, optionIdx));
        }

        if (selectActive !== -1) {
        }


        return optionProps;
      }
    );

    return (
      <div className={classnames} onClick={this.handleClick}>
        {children}
      </div>
    );
  }
}

export default QuestionSelect;
