# Chap 04. 純 React

> 本章目標：檢視背後的運行並認識 React 如何運作 (非 JavaScript as XML - JSX)

## 網頁設定

為讓 React 在瀏覽器中執行，我們需要兩個函式庫：

- React：建構 view 的函式庫
- ReactDOM：在瀏覽器中繪製 UI 的函式庫

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Pure React Samples</title>
</head>
<body>

<!-- Target container -->
<div class="react-container"></div>

<!-- React library & ReactDOM -->
<script src="https://unpkg.com/react@15.6.2/dist/react.js"></script>
<script src="https://unpkg.com/react-dom@15.6.2/dist/react-dom.js"></script>
<script>
  
  // 純 React 與 JavaScript 程式碼
  
</script>
</body>
</html>
```

這些是在瀏覽器中使用 React 的最基本需求。

## 虛擬 DOM

HTML 是瀏覽器在建構稱為 DOM 的文件文件模型時會執行的一組指令。組成 HTML
文件的元素會在瀏覽器載入 HTML 並繪製使用者介面時變成 DOM 元素。

在 HTML 中，階層中相關的元素與家族樹相似。

傳統上，網站由獨立的 HTML 網頁組成。使用者瀏覽這些網頁時，瀏覽器會請求與載入不同的
HTML 文件。AJAX 的發明產生了單頁應用程式。由於瀏覽器會使用 AJAX
請求與載入資料，整個網頁應用程式可在單一網頁中執行並依靠 JavaScript 更新使用者界面。

在 SPA 中，瀏覽器先載入初始 HTML
文件。使用者瀏覽時其實還在同一頁。使用者與應用程式互動過程中 JavaScript
清除與構建新的使用者介面，感覺上像是從一頁跳到另一頁，實際上還是在同一個 HTML
頁並由 JavaScript 執行工作。

DOM API 是一組 JavaScript 可與瀏覽器互動以改變 DOM 的物件。用過
document.createElement 或 document.appendChild 就是使用過 DOM API。在
JavaScript 中修改已經存在的 DOM
元素相當的簡單。然而，插入新元素的程序很慢。這表示網頁開發者注意修改 UI 的方式可改善應用程式的效能。

有效率地以 JavaScript 管理 DOM
的變化很複雜且花時間。從程式設計角度看，清除特定元素的所有子元素並重新建構比留下這些子元素並嘗試修改它們更為容易。問題是我們沒有時間或能力學習有效率操作
DOM API 的 JavaScript 進階知識。解決方案是依靠 React。

React 是用來更新瀏覽器的 DOM 的函式庫。我們不再需要為建構高效能 SPA
的複雜性傷腦筋，因為 React 可幫我們處理。使用 React 不需要直接處理 DOM
API。相對的，我們與*虛擬 DOM*互動或設定建構 UI 以及與瀏覽器互動的 React 指令。

虛擬 DOM 由概念上類似 HTML 元素的 React 元素組成，但實際上是 JavaScript
物件。直接使用 JavaScript 物件比透過 DOM API 更快。我們修改 JavaScript
物件與虛擬 DOM，而 React 盡可能有效率的使用 DOM API 來繪製這些改變。

## React 元素

瀏覽器的 DOM 由 DOM 元素組成。React 的 DOM 由 React 元素組成。React 元素是
DOM 元素外觀的描述。換句話說，React 元素是瀏覽器的 DOM 要如何建構的指令。

使用 React.creteElement 建構代表 h1 的 React 元素：

```javascript
React.createElement("h1", null, "Baked Salmon");
```

- 第一個參數：定義要建構的元素型別
- 第三個參數：元素的子元素
- 第二個元素：元素的屬性

繪製時，React 會將此元素轉換成實際的 DOM 元素：

```html
<h1>Baked Salmon</h1>
```

元素具有屬性時會以屬性描述。下面是具有 id 與 data-type 屬性的 h1 標籤範例：

```javascript
React.createElement("h1",
  {id: "recipe-0", 'data-type': "title"},
  "Baked Salmon"
);
```

```html
<h1 data-reactroot id="recipe-0" data-type="title">Baked Salmon</h1>
```

> Top! data-reactroot  
> data-reactroot 以 React 元件根元素的屬性存在。在 15 版之前，React 的 ID
> 會加到元件的每個節點，這樣可幫助繪製與追蹤需要更新的元素。現在只會在根加入一個屬性，而繪製則根據元素階層追蹤。

因此，React 元素只是告訴 React 如何建構 DOM 元素的 JavaScript 實字
(literal)。以下顯示 createElement 實際建構的元入：

```javascript
{
  $$typeof: Symbol(React.element),
  "type": "h1",
  "key": null,
  "ref": null,
  "props": {"children": "Baked Sakmon"},
  "_owner": null,
  "_store": {}
}
```

這是個 React 元素，具有 React 使用的欄位：_owner、_store、$$typeof。key 與
ref 是 React 元素的重要欄位，第五章將會說明。現在我們進一步檢視 type 與 props 欄位。

- type 屬性告訴 React 要建構哪一種 HTML 或 SVG 元素
- props 屬性代表建構 DOM 元素所需的子元素
  - children 屬性用於以文字顯示其他嵌套元素

## ReactDOM

ReactDOM 帶有在瀏覽器中繪製 React 元素所需的工具。我們可在 ReactDOM 中找到
render 方法與用於伺服器的 renderToString 與 renderToStaticMarkup
方法，它們會在第十二章深入討論。從虛擬 DOM 產生 HTML 的工具都在這個函式庫裡。

我們可使用 ReactDOM.render 在 DOM 中繪製 React 元素與其子元素。要繪製的元素作為第一個參數傳入，第二個參數是繪製此元素的目標節點：

```javascript
var dish = React.createElement('h1', null, "Backed Salmon")

ReactDOM.render(dish, document.getElementById('react-container'))
```

React 所有 DOM 繪製功能被移到 ReactDOM 中，因為我們也可以用 React
建構原生應用程式。瀏覽器只是 React 的標的之一。

你要做的就是這些。建構元素然後在 DOM 中繪製。下一節討論如何使用 props.children。

## 子元素

ReactDOM 可讓你在 DOM 中繪製單一元素。React 將它的標籤設定為
data-reactroot。其他 React 元素嵌套在單一元素中。

React 使用 props.children 繪製子元素。我們也可將其他 React 元素繪製成子元素，就構出元素樹。

```javascript
React.createElement(
  "ul",
  null,
  React.createElement('li', null, "1 lb Salmon"),
  React.createElement('li', null, "1 cup Pine Nuts"),
  React.createElement('li', null, "2 cups Butter Lettuce"),
  React.createElement('li', null, "1 Yellow Squash"),
  React.createElement('li', null, "1/2 cup Olive Oil"),
  React.createElement('li', null, "3 cloves of Garlic"),
);
```

傳送給 createElement 函式的其他參數是其他子元素。React 建構這些子元素的陣列並設定 props.children
值給該陣列。

檢視產生出的 React 元素會看到每個清單項目代表一個 React 元素並加入
props.children 陣列：

```javascript
{
  "type": "ul",
  "props": {
    "children": [
      {"type": "li", "props": {"children": "1 lb Salmon"} ...},
      {"type": "li", "props": {"children": "1 cup Pine Nuts"} ...},
      {"type": "li", "props": {"children": "2 cups Butter Lettuce"} ...},
      {"type": "li", "props": {"children": "1 Yellow Squash"} ...},
      {"type": "li", "props": {"children": "1/2 cup Olive Oil"} ...},
      {"type": "li", "props": {"children": "3 cloves of Garlic"} ...},
    ]
    ...
  }
}
```

可看到每個清單項目都是各子元素。


> Top! React 的 className  
> 任何具有 HTML class 屬性的元素使用 className 屬性取代 class。由於 class 是
> JavaScript 保留字，我們必須使用 className 來定義 HTML 元素的 class 屬性

純 React 看起來就像是這樣。最終在瀏覽器中執行的是純 React。虛擬 DOM 是 React
元素從單一根長出的樹。

**React 元素是 React 用於在瀏覽器中建構 UI 的指令**。

## 以資料建構元素

使用 React 的主要好處是能夠分離 UI 元素與資料。由於 React 只是
JavaScript，我們可加上 JavaScript 邏輯來幫助我們建構 React
元件樹。舉例來說，材料可以儲存在陣列中，而我們可以對應該陣列與 React 元素。

```javascript
var items = [
  "1 lb Salmon",
  "1 cup Pine Nuts",
  "2 cups Butter Lettuce",
  "1 Yellow Squash",
  "1/2 cup Olive Oil",
  "3 cloves of Garlic"
]

React.createElement(
  "ul",
  {className: 'ingredients'},
  items.map(ingredient => React.createElement('li', null, ingredient))
);
```

不過執行此程式碼，你會看到如下的錯誤：

```
Warning: Each child in an array or iterator should have a unique "key" prop. Check the top-level render call using <ul>. See https://fb.me/react-warning-keys for more information. in li
```

迭代陣列以建構子元素清單時，React 預期每個元素都有 key 屬性。React 依 key 屬性對
DOM
進行更新。第五章會討論鍵與需要它的原因，但現在你可以對每個清單項目元素加上獨特的
key 屬性以排除警告訊息。我們可使用材料的陣列索引作為獨特值。

```javascript
React.createElement("ul", {className: "ingredients"},
  items.map((ingredient, i) => React.createElement('li', {key: i}, ingredient))
);
```

## React 元件

使用者介面由組件組成。

在 React 中，每個組件稱為**元件**。元件能讓資料集重複使用相同的 DOM 結構。

思考要以 React 建構的使用者界面時，找尋可將元素拆解成可重複使用的片段的機會。

讓我們看看建構元件的三種不同方式：createClass、ES6 類別與無狀態的函式性元件。

### React.createClass

React 於 2013 年發表時只有一種建構元件的方式：createClass 函式。

已有新的方法建構元件，但 React 專案還是廣泛使用 createClass。然而 React
團隊已經表示未來可能會停用 createClass。

使用 React.createClass 建構回傳一個以陣列儲存材料的清單項目之無排序清單元素的
React 元件。

```javascript
const IngredientsList = React.createClass({
  displayName: "IngredientsList",
  render() {
    return React.createElement("ul", {"className": "ingredients"},
      React.createElement('li', null, "1 lb Salmon"),
      React.createElement('li', null, "1 cup Pine Nuts"),
      React.createElement('li', null, "2 cups Butter Lettuce"),
      React.createElement('li', null, "1 Yellow Squash"),
      React.createElement('li', null, "1/2 cup Olive Oil"),
      React.createElement('li', null, "3 cloves of Garlic"),
    )
  }
});

const list = React.createElement(IngredientsList, null, null)

ReactDOM.render(
  list,
  document.getElementById('react-container')
)
```

元件讓我們可以用資料建構可重複使用的 UI。在 render 函式中，我們可使用 this
關鍵字指向元件實例，而實例的屬性可透過 this.props 存取。

下面我們建構一個使用此元件的元素並命名為 IngredientsList：

```javascript
<IngredientsList>
  <ul className="ingredients">
    <li>1 lb Salmon</li>
    <li>1 cup Pine Nuts</li>
    <li>2 cups Butter Lettuce</li>
    <li>1 Yellow Squash</li>
    <li>1/2 cup Olive Oil</li>
    <li>3 cloves of Garlic</li>
  </ul>
</IngredientsList>
```

資料可作為屬性傳給 React 元件。我們能以陣列傳遞資料給清單來建構可重複使用的材料清單：

```javascript
const IngredientsList = React.createClass({
  displayName: "IngredientsList",
  render() {
    return React.createElement("ul", {"className": "ingredients"},
      this.props.items.map((ingredient, i) =>
        React.createElement("li", {key: i}, ingredient)
      )
    )
  }
})

var items = [
  "1 lb Salmon",
  "1 cup Pine Nuts",
  "2 cups Butter Lettuce",
  "1 Yellow Squash",
  "1/2 cup Olive Oil",
  "3 cloves of Garlic"
]

const list = React.createElement(IngredientsList, {items}, null)

ReactDOM.render(
  list,
  document.getElementById('react-container')
)
```

現在再檢視 ReactDOM。items 這個資料屬性是具有六項材料的陣列。由於我們使用迴圈製作
li 標籤，可加上迴圈的索引值作為鍵：

```javascript
<IngredientsList items=[...]>
  <ul className="ingredients">
    <li key="0">1 lb Salmon</li>
    <li key="1">1 cup Pine Nuts</li>
    <li key="2">2 cups Butter Lettuce</li>
    <li key="3">1 Yellow Squash</li>
    <li key="4">1/2 cup Olive Oil</li>
    <li key="5">3 cloves of Garlic</li>
  </ul>
</IngredientsList>
```

元件是物件，它們可如同類別用於封裝程式碼。我們可建構繪製單一清單項目的方法並用它建構清單。

以下範例加上自訂方法：

```javascript
const IngredientsList = React.createClass({
  displayName: "IngredientsList",
  renderListItem(ingredient, i) {
    return React.createElement("li", {key: i}, ingredient)
  },
  render() {
    return React.createElement("ul", {className: "ingredients"},
      this.props.items.map(this.renderListItem)
    );
  }
})
```

這也是 MVC 語言中 view 的概念。與 IngredientsList 的 UI 有關的所有東西都封裝在元件中；我們需要的東西都在這裡。

現在我們可使用我們的元件建構 React
元素並將它作為屬性傳給元素清單。請注意現在元素的型別是字串——它正是元件的類別

> Top! 元件類別型別  
> 繪製 HTML or SVG
> 元素時，我們使用的是字串。以元件建構元素時，我們直接使用元件類別。這是
> IngredientsList 沒有用引號包圍的原因；我們將類別傳給 createElement
> 是因為它是個元件。React 會以此類別建構元件的實例並進行管理。

使用具有這種資料的 IngredientsList 元件會在 DOM 產生下列無排序清單：

```html
<ul data-reactroot className="ingredients">
  <li key="0">1 lb Salmon</li>
  <li key="1">1 cup Pine Nuts</li>
  <li key="2">2 cups Butter Lettuce</li>
  <li key="3">1 Yellow Squash</li>
  <li key="4">1/2 cup Olive Oil</li>
  <li key="5">3 cloves of Garlic</li>
</ul>
```

### React.Component

ES6 規格中的一個重要功能是 React.Component，它是用於建構新的 React
元件的抽象類別。我們可從階層中以 ES6 語法擴充這個類別來建構自訂元件。

```javascript
class IngredientsList extends React.Component {
  renderListItem(ingredient, i) {
    return React.createElement("li", {key: i}, ingredient)
  }
  render() {
    return React.createElement("ul", {className: "ingredients"},
      this.props.items.map(this.renderListItem)
    );
  }
}
```

### 無狀態函式性元件

無狀態函式性元件是函式而非物件；因此它們沒有 this
範圍。由於它們是簡單的純函式，我們會在應用程式中盡可能使用它們。有時候無狀態函式性元件不夠好以至於我們必須回頭使用
class or createClass，但一般來說能用就好。

無狀態函式性元件是取用屬性並回傳一個 DOM
元素的函式。無狀態函式性元件是實踐函式性程式設計的好方法。你應該盡量將無狀態函式性元件寫成純函式。它們取用屬性並回傳
DOM 元素而不會導致副作用。如此可以簡化程式且非常容易測試。

無狀態函式性元件能保持應用程式架構的簡潔，而 React
團隊承諾使用它們會有些效能增益。但若要封裝功能或 this 就不能使用它們。

```javascript
const IngredientsList = props =>
  React.createElement("ul", {"className": "ingredients"},
    props.items.map((ingredient, i) =>
      React.createElement("li", {key: i}, ingredient)
    )
  )
```

我們會以 ReactDOM.render 繪製這個元件，與使用 createClass or ES6 類別語法建構出的元件之繪製方式完全相同。它只是個函式，此函式透過參數接收資料並回傳資料項目組成的無排序清單。

改善這個無狀態函式性元件的一個方式是解構屬性參數：

```javascript
const IngredientsList = ({items}) =>
  React.createElement("ul", {"className": "ingredients"},
    items.map((ingredient, i) =>
      React.createElement("li", {key: i}, ingredient)
    )
  )
```

除了較清楚的語法外，Facebook 曾經暗示未來無狀態函式性元件可能會比 createClass or
ES6 class 語法更快。

## 繪製 DOM

由於我們能夠以屬性傳入資料給元件，因此可以分離應用程式建構 UI
的資料與邏輯。如此能讓我們比文件物件模型更容易操作獨立的資料集，改變此獨立資料集的任何值也改變了應用程式的狀態。

想像應用程式的所有資料儲存在單一 JavaScript
物件中，每次改變此物件時可將其作為屬性傳給元件並重新繪製 UI。這表示
ReactDOM.render 會要執行很多工作。

為了讓 React 在合理的時間內運作，ReactDOM.render
必須有聰明的作法，而它確實有。相較於清空再重建整個 DOM，ReactDOM.render
保持目前的 DOM 且只套用最少量有必要的改變。

ReactDOM.render 保持現有 DOM 只更新必須更新的 DOM 元素，盡可能非插入新 DOM
方式，若非得需要插入 DOM 元素也會嘗試減少 DOM 插入 (成本最高的操作)。

這種聰明的 DOM 繪製對 React
在合理時間內運作是必要的，因為應用程式的狀態經常改變。每次改變狀態時，我們需要
ReactDOM.render 有效率的繪製 UI。

## factory

目前為止我們建構元素的唯一方式是使用 React.createElement。另一個建構 React
元素的方式是使用 factory。factory 是將物件初始化的細節抽象畫的特殊物件。在 React
中，我們使用 factory 來幫助我們建構 React 元素的實例。

React 具有內建的 factory 以支援各種 HTML 與 SVG 的 DOM 元素，你可使用
React.createFactory 函式建構自訂元件的 factory。

以這一章 h1 元素為例：

```html
<h1>Baked Salmon</h1>
```

相較使用 createElement，我們可用內建的 factory 建構 React 元素：

```javascript
React.DOM.h1(null, "Baked Salmon");
```

- 第一個參數：屬性
- 第二個參數：子元素

```javascript
React.DOM.ul({"className": "ingredients"},
  React.DOM.li(null, "1 lb Salmon"),
  React.DOM.li(null, "1 cup Pine Nuts"),
  React.DOM.li(null, "2 cups Butter Lettuce"),
  React.DOM.li(null, "1 Yellow Squash"),
  React.DOM.li(null, "1/2 cup Olive Oil"),
  React.DOM.li(null, "3 cloves of Garlic"),
)
```

我們還可分離材料資料並使用 factory 來改善前面的定義：

```javascript
var items = [
  "1 lb Salmon",
  "1 cup Pine Nuts",
  "2 cups Butter Lettuce",
  "1 Yellow Squash",
  "1/2 cup Olive Oil",
  "3 cloves of Garlic"
]

var list = React.DOM.ul(
  {className: "ingredients"},
  items.map((ingredient, key) =>
    React.DOM.li({key}, ingredient)
  )
)

ReactDOM.render(list, document.getElementById('react-container'))
```

### 對元件使用 factory

若想要以作為函式呼叫的元件來簡化程式碼，你必須明確地建構一個 factory：

```javascript
const {render} = ReactDOM;

const IngredientsList = ({list}) =>
  React.createElement('ul', null,
    list.map((ingredient, i) =>
      React.createElement('li', {key: i}, ingredient)
    )
  );

const Ingredients = React.createFactory(IngredientsList);

const list = [
  "1 lb Salmon",
  "1 cup Pine Nuts",
  "2 cups Butter Lettuce",
  "1 Yellow Squash",
  "1/2 cup Olive Oil",
  "3 cloves of Garlic"
]

render(
  Ingredients({list}),
  document.getElementById('react-container')
)
```

我們以 Ingredients 這個 factory 快速的繪製出一個 React 元素。Ingredients
是如同 DOM 的 factory 取用屬性與子元素參數的函式。

若沒有使用 JSX，你會發現使用 factory 較多個 React.createElement
呼叫更好，但定義 React 元素最簡單與常見的方式是使用 JSX 標籤。若在 React 中使用
JSX，你可能不會用到 factory。

這一章使用 createElement 與 createFactory 來建構 React
元件。第五章會討論如何以 JSX 簡化元件的建構。