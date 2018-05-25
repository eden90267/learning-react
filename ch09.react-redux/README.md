# Chap 09. React Redux

這章要結合第六章建構的 UI 與上一章建構的 store。

第六章開發的應用程式將狀態集中在單一物件中 —— App 元件。

```javascript
class App extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      colors: [
        {
            "id": "0175d1f0-a8c6-41bf-8d02-df5734d829a4",
            "title": "ocean at dusk",
            "color": "#00c4e2",
            "rating": 5
        },
        {
            "id": "83c7ba2f-7392-4d7d-9e23-35adbe186046",
            "title": "lawn",
            "color": "#26ac56",
            "rating": 3
        },
        {
            "id": "a11e3995-b0bd-4d58-8c48-5e49ae7f7f23",
            "title": "bright red",
            "color": "#ff0000",
            "rating": 0
        }
      ]
    };
    this.addColor = this.addColor.bind(this);
    this.rateColor = this.rateColor.bind(this);
    this.removeColor = this.removeColor.bind(this);
  }
  // ...
  render() {
    const {addColor, rateColor, removeColor} = this;
    const {colors} = this.state;
    return (
      <div className="app">
        <AddColorForm onNewColor={addColor} />
        <ColorList colors={colors} 
                   onRate={rateColor}
                   onRemove={removeColor}/>
      </div>
    )
  }
}
```

App 元件是保存狀態的元件。狀態以屬性傳遞給子元件，特別是顏色從 App
元件的狀態以屬性傳給 ColorList 元件。發生事件時，資料從元件樹經由 callback
函式屬性傳回給 App 元件。

![](component-tree-data-flow.png)

上下傳遞資料的程序的複雜性導致 Redux
等函式庫的出現。相較於透過雙向函式綁定向上傳遞資料，我們可從子元件直接分發 action
來更新應用程式狀態。

這一章討論 Redux 的 store 的各種運作方式。首先檢視如何在沒有其他框架下運用
store，然後探索 react-redux 這個可整合 Redux 的 store 與 React 元件的框架。

## 明確的傳遞 store

首先整合 store 到 UI
最符合邏輯的方式是明確的以屬性將它傳遞到元件樹中。這種方式對僅有幾個嵌套元件的小程式最簡單可行。

讓我們看看如何整合 store 到顏色管理：

```javascript
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App";
import storeFactory from './store';

const store = storeFactory();

window.React = React;
window.store = store;

const render = () =>
  ReactDOM.render(
    <App store={store} />,
    document.getElementById('react-container')
  );

store.subscribe(render);
render();
```

將 store 傳給 App 後，我們必須繼續將它向下傳遞給需要它的子元件：

```javascript
// components/App.js
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
```

App 元件是根元件。它從屬性取得 store 並明確地向下傳遞給籽元件。store 以屬性傳遞給
SortMenu、AddColorForm 與 ColorList 元件。

從 App 傳遞出 store，我們可以在子元件中使用它。記得我們可以用 store.getState
讀取狀態，我們可以用 store.dispatch 分發 action 給 store。

```javascript
// components/AddColorForm.js
import PropTypes from 'prop-types';
import {addColor} from '../actions';
import '../../stylesheets/AddColorForm.scss';

const AddColorForm = ({store}) => {

  let _title, _color;

  const submit = e => {
    e.preventDefault();
    store.dispatch(addColor(_title.value, _color.value));
    _title.value = '';
    _color.value = '#000000';
    _title.focus()
  };

  return (
    <form className="add-color" onSubmit={submit}>
      <input ref={input => _title = input}
             type="text"
             placeholder="color title..." required/>
      <input ref={input => _color = input}
             type="color" required/>
      <button>ADD</button>
    </form>
  )
};

AddColorForm.propTypes = {
  store: PropTypes.object,
};

export default AddColorForm;
```

ColorList 元件可使用 store 的 getState
方法取得原來的顏色並加以排序。它也可在發生 RATE_COLOR 與 REMOVE_COLOR 時直接分發：

```javascript
// components/ColorList.js
import PropTypes from 'prop-types';
import Color from "./Color";
import {sortFunction} from '../lib/array-helpers';
import {rateColor, removeColor} from "../actions";
import '../../stylesheets/ColorList.scss';


const ColorList = ({store}) => {
  const {colors, sort} = store.getState();
  const sortedColors = [...colors].sort(sortFunction(sort));
  return (
    <div className="color-list">
      {(colors.length === 0) ?
        <p>No Colors Listed. (Add a Color)</p> :
        sortedColors.map(color =>
          <Color key={color.id} {...color}
                 onRate={(rating) =>
                   store.dispatch(rateColor(color.id, rating))}
                 onRemove={() =>
                   store.dispatch(removeColor(color.id))}/>
        )
      }
    </div>
  );
};

ColorList.propTypes = {
  store: PropTypes.object
};

export default ColorList;
```

此 store 從元件樹一路向下傳遞至 ColorList
元件。這種方式在元件樹如顏色管理程式一樣較小時很棒。使用這種方式的缺點是我們必須明確地將
store
傳遞給子元件，智表示比其他方式更多的程式碼與麻煩。此外，SortMenu、AddColorForm
與 ColorList 元件需要這種 store。這讓它們難以於其他應用程式中重複使用。

接下來幾節會討論其他讓元件取得 store 的方式。

## 透過 context 傳遞 store

傳統透過屬性傳遞 store 如同搭火車，要經過中間好幾個縣市。透過 context 間接傳遞
store 如同搭飛機。飛機從台北到高雄會飛過中間的縣市 —— 不需要道路。

我們可利用 React 的 context
功能讓我們傳遞變數給元件而不需要以屬性在樹中傳遞。任何子元素可以存取這些 context 變數。

首先要重構 App 元件以保存 context。App 元件也需要傾聽 store 以利於狀態異動觸發
UI 的更新：

```javascript
import PropTypes from 'prop-types';
import {Component} from 'react';
import SortMenu from "./SortMenu";
import AddColorForm from "./AddColorForm";
import ColorList from "./ColorList";

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
    const sortedColors = [...colors].sort(sortFunction);
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
```

首先，對元件加入 context 需要使用 getChildContext 生命期函式，它會回傳定義 context 的物件。此例中，我們將 store 加入到 context 中，它可透過屬性存取。

接下來，你必須設定元件實例的 childContextTypes 並定義你的 context 物件。這類似將 propTypes 或 defaultProps 加到元件實例中，但要讓 context 運作就必須採取這個步驟。

此時，App 元件的子元件可以透過 context 存取 store，它們可直接呼叫 store.getState 與 store.dispatch。最後一個步驟是訂閱 store 並在 store 更新狀態時更新元件樹，這可以透過載入生命期函式完成。我們可在 componentWillMount 訂閱 store 並使用 this.forceUpdate 觸發更新生命期以重新繪製 UI。在 componentWillUnmount 中，我們可以呼叫 unscribe 函式以停止傾聽 store。由於 App 元件本身會觸發 UI 更新，不再需要從 `./index.js` 檔案訂閱 store；我們從將 store 加入 context 的 App 傾聽 store 的異動。