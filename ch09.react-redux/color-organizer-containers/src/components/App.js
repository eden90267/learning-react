import PropTypes from 'prop-types';
import {Component} from 'react';
import {Menu, NewColor, Colors} from "./containers";
import '../../stylesheets/APP.scss'

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
    return (
      <div className="app">
        <Menu/>
        <NewColor/>
        <Colors/>
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