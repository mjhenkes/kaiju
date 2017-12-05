/* eslint import/no-unresolved: [2, { ignore: ['../componentMap'] }] */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// eslint-disable-next-line import/extensions
import componentMap from '../componentMap';

const propTypes = {
  /**
   * The Component Identifer
   */
  id: PropTypes.string.isRequired,
  /**
   * Whether the Component is sortable
   */
  isSortable: PropTypes.bool,
  /**
   * The Component type
   */
  elementType: PropTypes.string.isRequired,
};

class Element extends React.Component {
  constructor(props) {
    super(props);
    this.register = this.register.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.register();
  }

  componentDidUpdate() {
    this.register();
  }

  handleClick(event) {
    event.stopPropagation();
    window.postMessage({ message: 'kaiju-select', id: this.props.id }, '*');
    window.parent.postMessage({ message: 'kaiju-component-selected', id: this.props.id }, '*');
  }

  register() {
    // eslint-disable-next-line react/no-find-dom-node
    const node = ReactDOM.findDOMNode(this);
    const { id, elementType, isSortable } = this.props;

    node.removeEventListener('click', this.handleClick);
    node.setAttribute('data-kaiju-component-id', id);
    node.setAttribute('data-kaiju-component-type', elementType);
    node.setAttribute('draggable', elementType !== 'kaiju::Placeholder' && elementType !== 'kaiju::Workspace');
    node.addEventListener('click', this.handleClick);

    if (isSortable) {
      node.setAttribute('data-kaiju-sortable', true);
    }
  }

  render() {
    // eslint-disable-next-line no-unused-vars, react/prop-types
    const { dispatch, elementType, isSortable, ...props } = this.props;
    return React.createElement(componentMap[elementType], props);
  }
}

Element.propTypes = propTypes;

const generateProperties = (properties, property, isSortable) => {
  const { id, type, value } = property;

  if (value === undefined || value === null) {
    return null;
  } else if (type === 'Array') {
    return value.map(item => generateProperties(properties, properties[item.id], true));
  } else if (type === 'Hash') {
    const hash = {};
    let isEmpty = true;
    Object.keys(value).forEach((key) => {
      const hashValue = generateProperties(properties, properties[value[key].id]);
      if (hashValue !== undefined && hashValue !== null) {
        hash[key] = hashValue;
        isEmpty = false;
      }
    });
    return isEmpty ? {} : hash;
  } else if (type === 'Component') {
    return <ElementContainer id={value.id} key={value.id} isSortable={isSortable} />;
  } else if (type === 'Number') {
    return Number(properties[id].value);
  }
  return properties[id].value;
};

const mapStateToProps = ({ components }, { id }) => {
  const { properties, type } = components[id];

  const props = { id, elementType: type };
  Object.keys(properties).forEach((key) => {
    // Filter top level properties. Any key cotaining :: is a sub property
    if (!key.includes('::')) {
      props[key] = generateProperties(properties, properties[key]);
    }
  });

  return props;
};

const ElementContainer = connect(mapStateToProps)(Element);
export default ElementContainer;
