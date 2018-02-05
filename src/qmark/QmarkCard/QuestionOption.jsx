import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import PropTypes from 'prop-types';

class QuestionOption extends Component {

  static propTypes = {
    no: PropTypes.string,
    idx: PropTypes.number,
    checked: PropTypes.bool,
    onClick: PropTypes.func,
    onDimension: PropTypes.func
  };

  static contextTypes = {
    store: PropTypes.object
  };

  static defaultProps = {
    checked: false,
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const { checked, onClick } = this.props;
    return checked !== nextProps.checked || onClick !== nextProps.onClick;
  }

  componentDidMount() {
    const { idx, onDimension } = this.props;

    if (onDimension) {
      const node = findDOMNode(this);
      onDimension(idx, node.offsetWidth, node.offsetHeight);
    }
  }

  render() {
    const { no, checked, focus, children, onClick } = this.props;

    const classnames = [
      'question-option',
      checked && 'checked',
      focus && 'focus',
    ].filter(Boolean).join(' ');

    return (
      <div className={classnames} no={no} onClick={onClick}>
        <span className="option-no">{no}</span>
        {children}
      </div>
    );
  }
}

export default QuestionOption;
