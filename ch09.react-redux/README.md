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

```javascript
// components/AddColorForm.js
import PropTypes from 'prop-types';
import {addColor} from '../actions';
import '../../stylesheets/AddColorForm.scss';

const AddColorForm = (props, {store}) => {

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

AddColorForm.contextTypes = {
  store: PropTypes.object,
};

export default AddColorForm;
```

context
物件以第二個參數傳給無狀態函式性元件。我們可以使用物件解構直接從參數物件取得
store。為使用此 store，我們必須定義 AddColorForm 實例的
contextTypes。我們在此告訴 React 這個元件要使用哪一個 context
變數。這是必要的步驟，沒有它則 store 無法從 context 存取。

讓我們看看在元件類別如何使用 context：

```javascript
// components/Color.js
import {Component} from 'react';
import PropTypes from 'prop-types';
import StarRating from "./StarRating";
import '../../stylesheets/Color.scss'
import {rateColor, removeColor} from "../actions";

class Color extends Component {

  render() {
    const {id, title, color, rating, timestamp} = this.props;
    const {store} = this.context;
    return (
      <section className="color">
        <h1>{title}</h1>
        <button onClick={() => store.dispatch(removeColor(id))}>X</button>
        <div className="color"
             style={{backgroundColor: color}}>
        </div>
        <div>
          <StarRating starsSelected={rating} onRate={(rating) => store.dispatch(rateColor(id, rating))}/>
        </div>
      </section>
    )
  }

}

Color.contextTypes = {
  store: PropTypes.object
};

Color.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  rating: PropTypes.number
};

export default Color;
```

從 context 存取 store
是減少佔位模板的好辦法，但並非每個應用程式都需要這麼做。Redux 的創造者 Dan
Abramov 建議不要盲目使用這種模式：

分離容器與展示層通常是個好主意，但不是絕對。只有在真正能夠簡化程式碼的複雜性時再這麼做。

## 展示性與容器元件

前面範例中的元件，都直接與 Redux 的 store 互動以繪製 UI 元素。我們可以解耦 store
與繪製 UI 的元件，以改善應用程式的架構。

**展示性元件**是只繪製 UI
元素的元件。它們並不與資料架構緊密耦合，而是以屬性接收資料並透過 callback
函式屬性發送資料給他們的父元件。它們只在乎 UI
並能供帶有不同資料的應用程式重複使用。除了 App 元件外，第六章建構的所有元件都是展示性元件。

**容器元件**是連接展示性與資料的元件。我們的容器元件會透過 context 存取 store
並管理與 store 的互動。它們對應屬性與狀態以及 callback 函式屬性與 store 的
dispatch 方法以繪製展示性元件。容器元件不在乎 UI 元素；它們用於連接展示性元件與資料。

這種架構有許多好處。展示性元件可重複使用，它們容易替換與測試，並且可以組合成 UI。展示性元件可跨使用不同資料函式庫的瀏覽器應用程式重複使用。

容器元件完全不在乎 UI，它們的目標是連接展示性元件與資料架構。容器元件可跨裝置平台連接原生展示性元件與資料。

第六章建構的 AddColorForm、ColorList、Color、StarRating 與 Star
元件是展示性元件的例子。它們透過屬性接收資料，發生事件時呼叫 callback 函式屬性。我們已經相當熟悉展示性元件，接下來看看如何使用他們建構容器元件。

App 元件幾乎維持原樣。它還是在 context 中定義 store
以讓子元件可以存取。相較於繪製 SortMenu、AddColorForm 與 ColorList
元件，它會繪製這些項目的容器。Menu 連接 SortMenu、NewColor 連接
AddColorForm，而 Color 連接 ColorList：

```javascript
render() {
  return (
    <div className="app">
        <Menu/>
        <NewColor/>
        <Colors/>
    </div>
  )
}
```

要連接展示性元件與資料時，你可以將該元件包裝在控制屬性與連接資料的容器中。NewColor、Menu
與 Colors 等容器可定義在同一個檔案中：

```javascript
import PropTypes from 'prop-types';
import AddColorForm from "./ui/AddColorForm";
import {addColor, rateColor, removeColor, sortColors} from "../actions";
import SortMenu from "./ui/SortMenu";
import ColorList from "./ui/ColorList";
import {sortFunction} from "../lib/array-helpers";

export const NewColor = (props, {store}) =>
  <AddColorForm onNewColor={(title, color) =>
    store.dispatch(addColor(title, color))
  }/>;
NewColor.contextTypes = {
  store: PropTypes.object
};

export const Menu = (props, {store}) =>
  <SortMenu sort={store.getState().sort}
            onSelect={(sortBy) => store.dispatch(sortColors(sortBy))}/>;
Menu.contextTypes = {
  store: PropTypes.object
};

export const Colors = (props, {store}) => {
  const {colors, sort} = store.getState();
  const sortedColors = [...colors].sort(sortFunction(sort));
  return (
    <ColorList colors={sortedColors}
               onRemove={id => store.dispatch(removeColor(id))}
               onRate={(id, rating) => store.dispatch(rateColor(id, rating))}/>
  );
};
Colors.contextTypes = {
  store: PropTypes.object
};
```

所有 Redux 的功能在這個檔案中連結。請注意，action
建構程序被集中匯入與使用。這是唯一叫用 store.getState 或 store.dispatch 的檔案。

這種分離 UI 元件與連接資料容器的方式通常是個好作法，但對小專案、概念驗證或原型來說就有點過頭。

下一節介紹 React Redux 函式庫。此函式庫可用於快速加入 Redux 的 store 給
context 並建構容器元件。

## React Redux 的 provider

React Redux 是簡化間接透過 context 傳遞 store 的複雜性函式庫。Redux
並不要求你使用此函式庫，但使用 React Redux 可減少程式碼的複雜性並幫助你更快的建構應用程式。

```shell
npm i react-redux --save 
```

react-redux 提供設定 context 中 store 的 provider 元件。我們可用此 provider
包裝 React 元素，使該元素的子元素可透過 context 存取 store。

相較在 App 元件中將 store 設定成 context 變數，我們可保持 App 元件的無狀態。

```javascript
import {Menu, NewColor, Colors} from "./containers";
import '../../stylesheets/APP.scss'

const App = () =>
  <div className="app">
    <Menu/>
    <NewColor/>
    <Colors/>
  </div>;

export default App;
```

provider 將 store 加入 context 並於 action 被分發時更新 App 元件。此
provider 預期單一子元件：

```javascript
import React from 'react';
import {render} from 'react-dom';
import App from "./components/App";
import storeFactory from './store';
import {Provider} from "react-redux";

const store = storeFactory();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react-container')
);
```

此 provider 需要我們以屬性傳遞 store，它將該 store 加到 context 中以讓 App 元件的子元件可以存取到它。可節省時間與簡化程式碼。

使用 provider 後，我們可以在子容器元件中透過 context 存取 store，但 React
Redux 提供另一種快速建構操作 provider 容器元件的方式：connect 函式。

## React Redux 的 connect

若我們保持 UI 元件為純展示性，可以依靠 React Redux 建構容器元件。React Redux
透過對應目前 Redux 的 store 狀態與展示性元件的屬性幫助我們建構容器元件。它還對應
store 的 dispatch 函式與 callback 屬性。這都透過稱為 connect 的高階函式達成。

讓我們使用 connect 建構 Colors 容器元件：

```javascript
import {addColor, rateColor, removeColor, sortColors} from "../actions";
import ColorList from "./ui/ColorList";
import {sortFunction} from "../lib/array-helpers";
import {connect} from "react-redux";

export const Colors = connect(
  // mapStateToProps
  state => ({
    colors: [...state.colors].sort(sortFunction(state.sort))
  }),
  // mapDispatchToProps
  dispatch => ({
    onRemove(id) {
      dispatch(removeColor(id));
    },
    onRate(id, rating) {
      dispatch(rateColor(id, rating));
    }
  })
)(ColorList);
```

connect 是一個回傳一個回傳一個元件的函式的高階函式。這不是打錯字或繞口令：函式性
JavaScript 就是這樣。connect 預期兩個參數：mapStateToProps 與
mapDispatchToProps，兩者都是函式。它回傳一個預期展示性元件並以透過屬性傳送資料的容器將其包裝的函式。

connect 與 provider 一起運作。provider 將 store 加入 context，而 connect
建構存取 store 的元件。使用 connect 時無須關心 context。

所有容器可在一個檔案內使用 React Redux 的 connect 函式建構：

```javascript
import AddColorForm from "./ui/AddColorForm";
import {addColor, rateColor, removeColor, sortColors} from "../actions";
import SortMenu from "./ui/SortMenu";
import ColorList from "./ui/ColorList";
import {sortFunction} from "../lib/array-helpers";
import {connect} from "react-redux";

export const NewColor = connect(
  // mapStateToProps
  null,
  // mapDispatchToProps
  dispatch => ({
    onNewColor(title, color) {
      dispatch(addColor(title, color));
    }
  })
)(AddColorForm);

export const Menu = connect(
  // mapStateToProps
  state => ({
    sort: state.sort
  }),
  // mapDispatchToProps
  dispatch => ({
    onSelect(sortBy) {
      dispatch(sortColors(sortBy));
    }
  })
)(SortMenu);


export const Colors = connect(
  // mapStateToProps
  state => ({
    colors: [...state.colors].sort(sortFunction(state.sort))
  }),
  // mapDispatchToProps
  dispatch => ({
    onRemove(id) {
      dispatch(removeColor(id));
    },
    onRate(id, rating) {
      dispatch(rateColor(id, rating));
    }
  })
)(ColorList);
```

connect 函式連接 Redux
與純展示性元件。第一個參數是個對應狀態變數與屬性的函式，第二個參數是發生事件時分發
action 的函式。若只想要對應 callback 函式屬性與 dispatch，你可以如 NewColor
容器的定義以 null 作為第一個參數。

這一章討論連接 Redux 與 React 的各種方式。

- 我們明確地以屬性在元件樹中向下傳遞 store
- 間接的將 store 透過 context 直接傳遞給元件
- 透過容器元件解耦 store 的功能與展示層
- 使用 react-redux 透過 context 與容器元件連接 store 與展示層

下一章討論如何撰寫這個應用程式各個部分的單元測試。
