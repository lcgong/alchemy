import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { closeBlank, forwardBlank, forwardOption, checkOption } from './redux';

class Question extends Component {

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(props) {
    super(props);

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  handleClick(evt) {
    evt.stopPropagation();
    this.context.store.dispatch(closeBlank());
  }

  onFocus(evt) {

    console.log('focused: ')

  }

  handleKeyPress(evt) {

    const store = this.context.store;
    const { keyCode } = evt;
    if (keyCode === 37) { // LEFT Key
      store.dispatch(forwardBlank(true));

    } else if (keyCode === 39) { // RIGHT key
      store.dispatch(forwardBlank(false));

    } else {
      // console.log(444, store.getState());
      const { selectIdx, focusOption } = store.getState();
      if (selectIdx !== -1 && selectIdx !== null) {
        // 存在可答题的选项板

        if (keyCode === 38) { // UP key
          store.dispatch(forwardOption(false));

        } else if (keyCode === 40) { // DOWN key
          store.dispatch(forwardOption(true));

        } else {
          if (keyCode === 13 || keyCode === 32) { // 回车键或者空格键
            if (focusOption !== -1) { // 已有选项选择
              store.dispatch(checkOption(selectIdx, focusOption, true));
            }
          } else if (keyCode >= 65 && keyCode <= 90) { // a-z letter
            let optIdx = keyCode - 65;
            if (optIdx < store.getState().optionCount[selectIdx]) {
              store.dispatch(checkOption(selectIdx, optIdx, true));
            }
          } else if (keyCode >= 65 && keyCode <= 90) { // a-z letter
            let optIdx = keyCode - 65;
            if (optIdx < store.getState().optionCount[selectIdx]) {
              store.dispatch(checkOption(selectIdx, optIdx, true));
            }            
          }
        }
      }
    }

    console.log('key', evt.keyCode);

  }

  render() {
    const { no, children } = this.props;

    return (
      <div className="question" no={no} tabIndex={0}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyPress} onFocus={this.onFocus}>
        {children}
      </div>
    );
  }
}

export default Question;
