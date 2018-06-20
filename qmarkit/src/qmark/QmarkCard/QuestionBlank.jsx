import React, { Component } from "react";
import PropTypes from "prop-types";

import { focusBlank } from "./redux";

class QuestionBlank extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    this.setState({
      blankActive: 0
    });
  }

  componentDidMount() {
    const { store } = this.context;
    const blankIdx = this.props.idx;

    this.unsubscribe = store.subscribe(() => {
      const state = this.state;
      console.log(5555, store.getState());
      const blankActive = store.getState().blanks[blankIdx];
      const answer = store.getState().answer[blankIdx];

      if (state.blankActive !== blankActive || state.answer !== answer) {
        this.setState({
          blankActive,
          answer
        });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleClick(evt) {
    evt.stopPropagation();

    const { idx, select } = this.props;
    this.context.store.dispatch(focusBlank(idx, select));
  }

  render() {
    const { no } = this.props;
    const { blankActive, answer } = this.state;

    const classnames = [
      "question-blank",
      answer && "answer",
      blankActive === 1 && "active",
      blankActive === -1 && "unspecified"
    ]
      .filter(Boolean)
      .join(" ");

    let answerChildren = null;
    if (answer) {
      answerChildren = (
        <span className="answer-group">
          {answer.map((optionIdx, i) => (
            <span className="option-no" key={i}>
              {" "}
              {getOptionNo(optionIdx)}{" "}
            </span>
          ))}
        </span>
      );
    }

    return (
      <span className={classnames} onClick={this.handleClick}>
        <span className="blank-no">{no + (answer ? "." : "")}</span>
        {answerChildren}
      </span>
    );
  }
}

function getOptionNo(optionIdx) {
  return String.fromCharCode(65 + optionIdx % 26);
}

export default QuestionBlank;
