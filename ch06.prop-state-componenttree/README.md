# Chap 06. 屬性、狀態與元件樹

這一章討論更好的管理資料與減少應用程式除錯時間的技巧。

元件樹中的資料處理是使用 React 的優勢之一。在 React
元件中運用資料的一些技巧可讓你的日子更輕鬆。集中管理資料並根據資料建構 UI 能讓我們的應用程式更容易理解。

## 屬性驗證

JavaScript 是個弱型別語言。任意改變資料型別，JavaScript 並不會抱怨。無效率的管理變數型別會需要大量時間進行除錯。

React 元件提供指定與檢驗屬性型別的方式，使用此功能可大幅減少應用程式的除錯時間。提供不正確的屬性型別會觸發警告。

React 有內建的自動化變數屬性型別檢驗。

- 陣列：React-PropTypes.array
- 布林：React-PropTypes.bool
- 函式：React-PropTypes.func
- 數字：React-PropTypes.number
- 物件：React-PropTypes.object
- 字串：React-PropTypes.string

我們這一節為食譜建構一個 Summary 元件。Summary
元件會顯示食譜的標題以及材料與步驟的數量。

須提供三個屬性給 Summary
元件：標題、材料陣列與步驟陣列。我們打算檢驗這些屬性以確保前者是字串後兩者是陣列，並在無資料時提供預設值。實作方式依建構元件而定，無狀態函式性元件與
ES6 類別實作方式不同。

### createClass 屬性檢驗

```javascript
// Summary.js
import {createClass} from 'react'

const Summary = createClass({
  displayName: 'Summary',
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients.length} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps.length}</span>
        </p>
      </div>
    )
  }
});
```

若 Summary 元件意外使用字串繪製會如何？

JavaScript 不會抱怨，但長度會以字串的字元數計算。

若在建構 Summary 元件時檢驗屬性的型別，React 可以幫我們抓蟲：

```javascript
const Summary = createClass({
  displayName: 'Summary',
  propTypes: {
    ingredients: PropTypes.array,
    steps: PropTypes.array,
    title: PropTypes.string,
  },
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients.length} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps.length} Steps</span>
        </p>
      </div>
    )
  }
});
```

這樣屬性使用若失當就會看到錯誤：

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>React example</title>
  <style>
  </style>
</head>
<body>
<div id="react-container"></div>

<script src="https://unpkg.com/react@15.6.2/dist/react.js"></script>
<script src="https://unpkg.com/react-dom@15.6.2/dist/react-dom.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.38/browser.js"></script>
<script type="text/babel">
  // JSX 程式碼放這裡，或連結帶有 JSX 的 JavaScript 檔案

  const {PropTypes, createClass} = React;
  const {render} = ReactDOM;

  const Summary = createClass({
    displayName: 'Summary',
    propTypes: {
      ingredients: PropTypes.array,
      steps: PropTypes.array,
      title: PropTypes.string,
    },
    render() {
      const {ingredients, steps, title} = this.props;
      return (
        <div className="summary">
          <h1>{title}</h1>
          <p>
            <span>{ingredients.length} Ingredients</span>
            &nbsp;|&nbsp;
            <span>{steps.length} Steps</span>
          </p>
        </div>
      )
    }
  });

  render(
    <Summary title="Peanut Butter and Jelly"
             ingredients="peanut butter, jelly, bread"
             steps="spread peanut butter and jelly between bread"/>,
    document.getElementById('react-container')
  );

</script>
</body>
</html>
```

屬性型別檢驗的警告：

![](https://imgur.com/qnqbwyv.png)

繪製 Summary 元件沒傳入屬性會產生停止應用程式的 JavaScript 錯誤。React
有個方式指定必要屬性，沒有提供 React 會觸發控制台警告：

```javascript
const Summary = createClass({
  displayName: 'Summary',
  propTypes: {
    ingredients: PropTypes.array.isRequired,
    steps: PropTypes.array.isRequired,
    title: PropTypes.string,
  },
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients.length} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps.length} Steps</span>
        </p>
      </div>
    )
  }
});
```

![](https://imgur.com/7woorAh.png)

Summary 元件預期 ingredients 陣列與 steps 陣列，但只有使用它們的 length
屬性。此元件用於顯示值的計量 (數字)，重寫成預期數字會更合理，因為元件其實不需要陣列：

```javascript
const Summary = createClass({
  displayName: 'Summary',
  propTypes: {
    ingredients: PropTypes.number.isRequired,
    steps: PropTypes.number.isRequired,
    title: PropTypes.string,
  },
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps} Steps</span>
        </p>
      </div>
    )
  }
});
```

讓此元件使用數字是更具彈性的作法。現在 Summary 元件只需顯示
UI；它將計算材料或步驟的任務交給元件樹中的父或子節點。

### 預設屬性

改善此元件的另一個作法是指派屬性的預設值。檢驗行為與你想的一樣：若沒有提供值就使用你指定的預設值。

```javascript
const Summary = createClass({
  displayName: 'Summary',
  propTypes: {
    ingredients: PropTypes.number.isRequired,
    steps: PropTypes.number.isRequired,
    title: PropTypes.string,
  },
  getDefaultProps() {
    return {
      ingredients: 0,
      steps: 0,
      title: "[recipe]"
    }
  },
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps} Steps</span>
        </p>
      </div>
    )
  }
});

render(
  <Summary/>,
  document.getElementById('react-container')
);
```

使用預設屬性可提升元件的彈性，並防止使用者沒有提供屬性時發生錯誤。

### 自定屬性檢驗

React
內建的檢驗程序適合確保有提供變數且型別正確，但有時候會需要更多檢驗。舉例，你可能會想要確保數字的範圍或值帶有特定字串。React 有提供建構自定檢驗程序的方式。

React 的自定檢驗以函式實作。此函式應該在不符檢驗條件時回傳錯誤或屬性有效時回傳 null。

基本的屬性型別檢驗只能根據一項條件檢查屬性，而自定檢驗程序可用多種方式檢查屬性。在此自定函式中，我們先檢查屬性值是否為字串，然後檢查長度不超過
20 個字元。

```javascript
const Summary = createClass({
  displayName: 'Summary',
  propTypes: {
    ingredients: PropTypes.number.isRequired,
    steps: PropTypes.number.isRequired,
    title: (props, propName) =>
      (typeof props[propName] !== 'string') ?
        new Error('A title must be a string') :
        (props[propName].length > 20) ?
          new Error('title is over 20 characters') :
          null,
  },
  getDefaultProps() {
    return {
      ingredients: 0,
      steps: 0,
      title: "[recipe]"
    }
  },
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps} Steps</span>
        </p>
      </div>
    )
  }
});
```

自定檢驗程序能讓你實作特定的檢驗條件。自定的檢驗程序可執行多個檢查並於未通過時回傳錯誤。自定檢驗程序是使用元件時預防錯誤的好辦法。

## ES6 類別與無狀態函式性元件

使用 ES6 類別，propTypes 與 defaultProps
的宣告定義於類別本身之外的類別實例。定義類別後，我們可設定 propTypes 與
defaultProps 物件實字。

```javascript
class Summary extends Component {
  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps} Steps</span>
        </p>
      </div>
    );
  }
}

Summary.propTypes = {
  ingredients: PropTypes.number.isRequired,
  steps: PropTypes.number.isRequired,
  title: (props, propName) =>
    (typeof props[propName] !== 'string') ?
      new Error('A title must be a string') :
      (props[propName].length > 20) ?
        new Error('title is over 20 characters') :
        null,
};

Summary.defaultProps = {
  ingredients: 0,
  steps: 0,
  title: "[recipe]"
};
```

propTypes 與 defaultProps 物件實字也可加到無狀態函式性元件中

```javascript
const Summary = ({ingredients, steps, title}) =>
  <div className="summary">
    <h1>{title}</h1>
    <p>
      <span>{ingredients} Ingredients</span>
      &nbsp;|&nbsp;
      <span>{steps} Steps</span>
    </p>
  </div>;

Summary.propTypes = {
  ingredients: PropTypes.number.isRequired,
  steps: PropTypes.number.isRequired,
  title: (props, propName) =>
    (typeof props[propName] !== 'string') ?
      new Error('A title must be a string') :
      (props[propName].length > 20) ?
        new Error('title is over 20 characters') :
        null,
};

Summary.defaultProps = {
  ingredients: 0,
  steps: 0,
  title: "[recipe]"
};
```

使用無狀態函式性類別時，你也可以選擇在函式參數直接設定預設屬性。

```javascript
const Summary = ({ingredients=0, steps=0, title='[recipe]'}) =>
  <div className="summary">
    <h1>{title}</h1>
    <p>
      <span>{ingredients} Ingredients</span>
      &nbsp;|&nbsp;
      <span>{steps} Steps</span>
    </p>
  </div>;
```

#### 類別靜態屬性

先前我們討論過 defaultProps 與 propTypes 如何定義類別之外。ECMAScript
規格的新提案中有另一種做法：類別欄位與靜態屬性

類別的靜態屬性能讓我們將 defaultProps 與 propTypes
封裝在類別宣告中。屬性初始化程序也提供封裝與更清楚的語法：

```javascript
class Summary extends Component {

  static propTypes = {
    ingredients: PropTypes.number.isRequired,
    steps: PropTypes.number.isRequired,
    title: (props, propName) =>
      (typeof props[propName] !== 'string') ?
        new Error('A title must be a string') :
        (props[propName].length > 20) ?
          new Error('title is over 20 characters') :
          null,
  };

  static defaultProps = {
    ingredients: 0,
    steps: 0,
    title: "[recipe]"
  };

  render() {
    const {ingredients, steps, title} = this.props;
    return (
      <div className="summary">
        <h1>{title}</h1>
        <p>
          <span>{ingredients} Ingredients</span>
          &nbsp;|&nbsp;
          <span>{steps} Steps</span>
        </p>
      </div>
    );
  }
}
```

每個元件都應該實作屬性驗證、自定屬性驗證與設定預設屬性值。這讓元件更容易重複使用，因為元件屬性的問題都會以警告顯示出來。

## 參考

又稱為 ref 的參考能讓 React 元件與子元素互動。ref 最常見的運用事與收集使用輸入的
UI 元素互動。以 HTML form
元素為例，這些元素是一開始就繪製好的，但使用者可以與它們互動。使用者與它們互動時，元件應該要做出適當的反應。

接下來我們要設計一個讓使用者儲存與管理十六進位顏色值的應用程式。這個顏色管理程序能讓使用者將顏色加入清單。顏色加入清單後，使用者可以加以評定或刪除。

我們需要一個表單向使用者收集顏色，使用者可以在相對應欄位中提供顏色的名稱與十六進位值。AddColorForm
元件繪製 HTML 的文字與顏色輸入以從顏色對話框收集十六進位值。

```javascript
class AddColorForm extends Component {
  render() {
    return (
      <form onSubmit={e => e.preventDefault()}>
        <input type="text" placeholder="color title..." required/>
        <input type="color" required/>
        <button>ADD</button>
      </form>
    )
  }
}
```

我們可使用 ref 參考 title 與 color 並與其互動：

```javascript
class AddColorForm extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const {_title, _color} = this.refs;
    alert(`New Color: ${_title.value} ${_color.value}`);
    _title.value = '';
    _color.value = '#000000';
    _title.focus();
  }

  render() {
    return (
      <form onSubmit={this.submit}>
        <input ref="_title"
               type="text"
               placeholder="color title..." required/>
        <input ref="_color"
               type="color" required/>
        <button>ADD</button>
      </form>
    )
  }
}
```

我們必須加入 constructor 給這個 ES6 元件類別，因為我們將 submit
放在它的函式中。**使用 ES6 元件類別時，我們必須綁定元件的範圍給必須存取 this 的任何方法**。

ref 是個 React 用來參考 DOM 元素的辨識符號。對輸入建構 _title 與 _color ref
屬性表示我們可以用、 this.refs._title 或 this.refs._color 存取這些元素。

> Top! 綁定 'this' 的範圍  
> 使用 React.createClass 建構元件時，不需綁定 this
> 範圍給元件的方法。React.createClass 會自動綁定 this 的範圍。

### 逆資料流

我們需要的是從使用者收集資料並發送到它處進行處理，也就是最終回到伺服器，這 ch12
再來討論。首先，我們要做的是從表單元件收集資料並加以傳送。

常見的 React
元件收集資料解決方式是**逆資料流**。它類似且有時被稱為雙向資料綁定，方式是將
callback
函式以屬性傳給元件，以讓元件將資料作為其參數回傳。它被稱為逆資料流是因為我們將
callback 函式以屬性傳給元件，讓元件將資料作為函式的參數回傳。

假設我們想要使用顏色表單，但在使用者提交新顏色時要收集此資訊並輸出到控制台。

我們可建構稱為 logColor 的函式以參數接受名稱與顏色。這些參數的值會輸出到控制台。

```javascript
class AddColorForm extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const {_title, _color} = this.refs;
    this.props.onNewColor(_title.value, _color.value);
    _title.value = '';
    _color.value = '#000000';
    _title.focus();
  }

  render() {
    return (
      <form onSubmit={this.submit}>
        <input ref="_title"
               type="text"
               placeholder="color title..." required/>
        <input ref="_color"
               type="color" required/>
        <button>ADD</button>
      </form>
    )
  }
}

const logColor = (title, color) =>
  console.log(`New Color: ${title} | ${color}`);

render(
    <AddColorForm onNewColor={logColor}/>,
    document.getElementById('react-container')
  );
```

AddColorForm
元件的工作是收集並傳遞資料，它不在乎資料發生什麼事。我們現在可以使用此表單向使用者收集顏色資料，並傳給其他元件或方法來處理資料：

```javascript
<AddColorForm onNewColor={(title, color) => {
  console.log(`TODO: add new ${title} and ${color} to the list`);
  console.log(`TODO: render UI with new Color`);
}}/>
```

準備就緒後，我們可以從這個元件收集資料並將顏色加到顏色清單。

#### 選擇性函式屬性

為實行雙向資料綁定，你必須在嘗試叫用它之前檢查函式屬性是否存在。

```javascript
if (this.props.onNewColor) this.props.onNewColor(_title.value, _color.value);
```

更好辦法是在 propTypes 與 defaultProps 定義函式屬性：

```javascript
AddColorForm.propTypes = {
  onNewColor: PropTypes.func,
};

AddColorForm.defaultProps = {
  onNewColor: f => f
};
```

`f => f` 虛函式。它只是回傳第一個參數的無作用佔位函式，可被 JavaScript
叫用而不會導致錯誤。

### 無狀態函式性元件的 ref

ref 也可用在無狀態函式性元件。這些元件沒有 this，因此不能使用
this.refs。相較於使用字串屬性，我們會以函式設定 ref。此函式會以參數傳入輸入實例，我們可捕捉該實例並儲存在區域變數中。

```javascript
const AddColorForm = ({onNewColor = f => f}) => {
  let _title, _color;
  const submit = e => {
    e.preventDefault();
    onNewColor(_title.value, _color.value);
    _title.value = '';
    _color.value = '#000000';
    _title.focus();
  };
  return (
    <form onSubmit={submit}>
      <input ref={input => _title = input}
             type="text"
             placeholder="color title..." required/>
      <input ref={input => _color = input}
             type="color" required/>
      <button>ADD</button>
    </form>
  );
};
```

在此無狀態函式性元件中，ref 以 callback 函式而非字串設定。此 callback
函式以參數傳遞元素的實例。此實例可捕捉並儲存在 _title 或 _color 等區域變數中。將
ref 儲存在區域變數後，提交表單時可輕鬆的存取它們。

## React 的狀態管理

目前我們只使用屬性來處理 React
元件中的資料。屬性是不可變的，繪製後元件的屬性不會改變。為改變
UI，我們需要其他機制以新屬性重新繪製元件樹。React
的狀態是內建的元件內資料異動管理選項。應用程式的狀態改變時，UI 會重新繪製以反映這些變動。

使用者與應用程式互動，它們瀏覽、搜尋、過濾、選取、新增、修改與刪除。使用者與應用程式互動時，應用程式狀態改變，而這些改變會在
UI 中反映給使用者。畫面與選單出現又消失、內容變化、指示器開啟又關閉，在 React
中，UI 反映應用程式的狀態。

狀態可用單一 JavaScript 物件在 React
元件中表示。元件的狀態改變時，元件繪製反應改變新
UI。還有什麼比它更函式性？輸入一些資料，React 元件會將資料以 UI
顯示。做出一些改變，React 會盡可能有效率的更新 UI 以反映變化。

讓我們看看如何在 React 元件中運用狀態。

### 元件的狀態

狀態代表我們預期會在元件中改變的資料。我們以 StartRating 元件做示範。

StarRating 元件需要兩個重要資料：要顯示的星號數量與星號數量代表的評分。

我們需要可點擊、具有 selected 屬性的 Star 元件。每個星號可用一個無狀態函式性元件表示：
