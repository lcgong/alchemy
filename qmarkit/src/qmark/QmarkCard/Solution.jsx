import React, { Component } from 'react';

class Solution extends Component {

  render() {
    const { answer, children } = this.props;

    let attrs = { answer };

    return (
      <div className="solution" {...attrs} >
        {children}
      </div>
    );
  }
}

export default Solution;