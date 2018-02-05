import React, { Component } from 'react';

class Subquestion extends Component {

  render() {
    const { no, children } = this.props;

    return (
      <div className="subquestion">
        <hr className="seperator" />
        <span className="subquestion-no">({no})</span>
        {children} 
      </div>
    );
  }
}

export default Subquestion;