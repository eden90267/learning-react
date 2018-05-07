# Chap 05. React 與 JSX

虛擬 DOM 是 React 建構與更新使用者介面時依循的一組指令，這些指令由 React 元素的
JavaScript 物件組成。我們已學過使用 React.createElement 與 factory。

另一種替代繁瑣的 React.createElement 的方式是 JSX，它是使用類似 HTML 語法定義
React 元素的 JavaScript 擴充。

這章將討論如何使用 JSX 建構虛擬 DOM 與 React 元素。

## 以 JSX 表示 React 元素

在 JSX 中，元素的型別是以一個標籤指定。該標籤屬性代表元素的屬性。元素的子元素可以放在標籤中間。

```javascript
<ul>
  <li>1 lb Salmon</li>
  <li>1 cup Pine Nuts</li>
  <li>2 cups Butter Lettuce</li>
  <li>1 Yellow Squash</li>
  <li>1/2 cup Olive Oil</li>
  <li>3 cloves of Garlic</li>
</ul>
```

將材料陣列以 JSX 傳給 IngredientsList：

```javascript
<IngredientsList list={[...]} />
```

傳遞材料陣列給此元件，我們必須以大括號包圍它。這稱為 JavaScript 表示式。以屬性傳遞
JavaScript 值給元件時必須這麼做。元件屬性有字串或 JavaScript 表示式。JavaScript
表示式可包含陣列、物件，甚至是函式。

## JSX 秘訣

### 嵌套的元件

```javascript
<IngredientsList>
  <Ingredient />
  <Ingredient />
  <Ingredient />
</IngredientsList>
```

### className

class 是 JavaScript 保留字，因此改用 className 來定義 class 屬性：

```javascript
<h1 className="fancy">Baked Salmon</h1>
```

### JavaScript 表示式

JavaScript
表示式包裝在大括弧中，且會回傳變數求值後的結果。舉例來說，若想要顯示元素中的 title
屬性值，我們可用 JavaScript 表示式插入該值。變數會求值並回傳：

```javascript
<h1>{this.props.title}</h1>
```

字串型別以外的值也可用 JavaScript 表示式：

```javascript
<input type="checkbox" defaultChecked={false}/>
```

### 求值

大括弧中間的 JavaScript 會被求值。這表示連接或相加等操作會執行，也表示
JavaScript 表示式中的函式會被呼叫：

```javascript
<h1>{"Hello" + this.props.title}</h1>

<h1>{this.props.title.toLowerCase().replace}</h1>

function appendTitle({this.props.title}) {
  console.log(`${this.props.title} is great!`)
}
```