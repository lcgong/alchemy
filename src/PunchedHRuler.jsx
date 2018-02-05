
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import { findDOMNode } from 'react-dom';
import './PunchedHRuler.css';


class PunchedHRuler extends Component {

  static contextTypes = {
    paperCard: PropTypes.object.isRequired
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.width !== nextContext.paperCard.width) {
      this.width = nextContext.paperCard.width;
      return true;
    }
  }

  render() {
    let width = this.context.paperCard.width || 0;
    
    return (
      <SvgLine width={width} height={17}></SvgLine>
    );
  }
}

export default PunchedHRuler;

function endpoint(x1, y1, x2, y2) {
  return `M ${x1} ${y1} A 5 5 0 0 1 ${x2} ${y2} Z`;
}

function SvgLine({ width, height }) {
  const midHeight = Math.floor(height / 2) + 1;
  return (
    <svg width={width} height={height}>
      <defs>
        <mask id="hole2">
          <rect width={width} height={height} fill="white" />
          <line strokeDasharray="12, 8, 3, 8"
            x1="0" y1={midHeight} x2={width} y2={midHeight}
            strokeWidth="2" strokeOpacity="1" stroke="black" />
          <path d={endpoint(0, 0, 0, height)} fill="black" />
          <path d={endpoint(width, height, width, 0)} fill="black" />
        </mask>
      </defs>
      <rect width={width} height={height} fill="white" mask="url(#hole2)" />
    </svg>
  );
}

