import { Component } from 'react';
import PropTypes from 'prop-types';

import { componentFactory } from './factory';

import Question from './Question';
import Solution from './Solution';
import Subquestion from './Subquestion';
import QuestionStem from './QuestionStem';
import QuestionBlank from './QuestionBlank';
import QuestionSelect from './QuestionSelect';
import QuestionOption from './QuestionOption';

import { createStore } from './redux';

const mapTagComponent = {
  'question': Question,
  'subquestion': Subquestion,
  'question-stem': QuestionStem,
  'question-blank': QuestionBlank,
  'question-select': QuestionSelect,
  'question-option': QuestionOption,
  'solution': Solution,
};

/** Qmark答题卡 */
class QmarkCard extends Component {

  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return {
      store: this.store
    };
  }

  buildTagComponents(text) {

    const tagtree = this.props.model;
    // console.log(333, tagtree);

    if (Array.isArray(tagtree)) {
      const {
        blankCount, selectCount, blankSelect, optionCount
      } = tagtree[1]; // attrs
      
      this.store = createStore(blankCount, selectCount, blankSelect, optionCount);
    }
  }

  componentWillMount() {
    this.buildTagComponents(this.props.text);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.text !== nextProps.text) {
      this.buildTagComponents(nextProps.props.text);
    }
  }

  render() {
    const tagtree = this.props.model;

    return componentFactory(mapTagComponent)(tagtree);
  }
}

export default QmarkCard;
