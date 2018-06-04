import {Component} from 'react';

const Expandable = ComposedComponent => class extends Component {

  constructor(props) {
    super(props);
    let collapsed = (typeof props.collapsed === 'boolean') ?
      props.collapsed : true;
    this.state = {collapsed};
    this.expandCollapse = this.expandCollapse.bind(this);
  }

  expandCollapse() {
    this.setState((prevState) => ({
      collapsed: !prevState.collapsed
    }));
  }

  render() {
    return <ComposedComponent expandCollapse={this.expandCollapse} {...this.state} {...this.props}/>
  }

};

export default Expandable;