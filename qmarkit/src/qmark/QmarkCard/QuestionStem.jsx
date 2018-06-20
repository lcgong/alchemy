import React, { Component } from 'react';

class QuestionStem extends Component {

  render() {
    const { children } = this.props;

    return (
      <div className="question-stem">
        {children}
      </div>
    );
  }
}

export default QuestionStem;