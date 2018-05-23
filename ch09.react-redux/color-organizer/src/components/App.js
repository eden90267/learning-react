import SortMenu from "./SortMenu";
import AddColorForm from "./AddColorForm";
import ColorList from "./ColorList";

import '../../stylesheets/APP.scss'

const App = ({store}) =>
  <div className="app">
    <SortMenu store={store}/>
    <AddColorForm store={store} />
    <ColorList store={store}/>
  </div>;

export default App;