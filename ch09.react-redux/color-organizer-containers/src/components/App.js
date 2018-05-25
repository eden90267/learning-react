import PropTypes from 'prop-types';
import {Component} from 'react';
import SortMenu from "./ui/SortMenu";
import AddColorForm from "./ui/AddColorForm";
import ColorList from "./ui/ColorList";

import '../../stylesheets/APP.scss'
import {sortFunction} from "../lib/array-helpers";

class App extends Component {

  getChildContext() {
    return {
      store: this.props.store
    };
  }

  componentWillMount() {
    this.unsubscribe = store.subscribe(
      () => this.forceUpdate()
    )
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const {colors, sort} = store.getState();
    const sortedColors = [...colors].sort(sortFunction(sort));
    return (
      <div className="app">
        <SortMenu/>
        <AddColorForm/>
        <ColorList colors={sortedColors}/>
      </div>
    )
  }

}

App.propTypes = {
  store: PropTypes.object.isRequired
};

App.childContextTypes = {
  store: PropTypes.object.isRequired
};


export default App;