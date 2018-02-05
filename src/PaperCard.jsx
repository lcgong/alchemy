import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';


class PaperCard extends Component {

  static childContextTypes = {
    paperCard: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      width: null,
    };
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  getChildContext() {
    return {
      paperCard: this.state
    };
  }

  updateDimensions() {
    let node = findDOMNode(this);

    this.setState({
      ...this.state,
      width: node.offsetWidth
    });

    // console.log('resize: ', node.offsetWidth, this.state);
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);

    // console.log('', this.context);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
  return (<div>
    {this.props.children}
  </div>);
  }
}

export default PaperCard;