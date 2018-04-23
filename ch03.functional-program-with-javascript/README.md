# JavaScript 的函式性程式設計

如果妳 map or reduce 過陣列，則你已經是函式性程式設計師。React、Flux 與 Redux
都算函式性 JavaScript 作法。認識函式性程式設計的基本概念能提升 React 應用程式的知識。

函式可作為參數傳給函式或從函式作為結果回傳。稱為高階函數的複雜函式可操作函式並以其作為參數或結果。

這一章討論一些函式性程式設計的概念與如何以 JavaScript 實作函式的技術。

## 函式性的意義

函式：第一類公民 (一等公民)。這表示函式能夠做變數所做的事。ES6
對語言的改善提升函式性程式設計技術，這包括

- 箭頭函式
- promise
- 展開運算子

在 JavaScript 中

- 函式可表示應用程式中的資料，如同宣告字串、數字或其他變數一樣以 var 關鍵字宣告
- 函式性程式設計師會寫出一大堆小函式，使用箭頭函式與法會簡單些
- 函式是變數，所以可以加入到物件
- 函式可加入陣列
- 函式可作為參數傳給其他函式

  ```javascript
  const insideFn = logger =>
    logger("They can be send to other functions as arguments")
  
  insideFn(message => console.log(message));
  ```

- 函式可從函式回傳

  ```javascript
  var createScream = logger => message =>
      logger(message.toUpperCase() + "!!!")
    
  
  const scream = createScream(message => console.log(message));

  scream('functions can be returned from other functions')
  scream('createScream returns a function')
  scream('scream invokes that returned function')
  ```

  需注意箭頭的數量。一個以上的箭頭表示有個高階函式。


我們可以說 JavaScript
是函式性語言，因為它的函式是第一類公民。這****表示函式是資料，它們可以儲存、讀取，或如同變數在應用程式中傳遞。

## 命令式與宣告式

函式性程式設計是**宣告式程式設計**範式的一部分。宣告式程式設計的應用程式設計方式是相較於定義如何達成而更強調要達成什麼。

為理解宣告式程式設計，我們可與命令式程式設計或只考慮如何達成結果的程式設計方式做比較。以一個常見任務為例：製作適用於
URL 的字串。這通常是將空白以破折號取代，因為 URL 不能有空白。首先看看命令式方式：

```javascript
var string = "This is the midday show with Cheryl Waters";
var urlFriendly = "";

for (var i = 0; i < string.length; i++) {
  if (string[i] === " ") {
    urlFriendly += "-"
  } else {
    urlFriendly += string[i]
  }
}

console.log(urlFriendly)
```

這種程式設計只考慮任務要如何完成。我們使用 for 迴圈與 if 陳述式並以等式運算子設定值。光看程式碼不會知道很多，命令式程式需要大量的註解才能說明會發生什麼事。

接下來可靠同樣問題的宣告式方式：

```javascript
const string = "This is the mid day show with Cheryl Waters";
const urlFriendly = string.replace(/ /g, "-");

console.log(urlFriendly)
```

我們使用 string.replace 與正規表示式將空白替換成破折號。使用 string.replace
是一種描述會發生什麼事的方式：字串中的空白會被替換。空白如何處理的細節被抽離在
replace 函式中。在宣告式程式中，語法本身描述要發生什麼，而如何發生的細節被抽離。

宣告式程式容易理解，因為程式碼本身描述會發生什麼。舉例來說，下面範例的語法描述從
API 載入會員後會發生什麼細節：

```javascript
const loadAndMapMembers = compose(
  combineWith(sessionStorage, "members"),
  save(sessionStorage, "members"),
  scopeMembers(window),
  logMemberInfoToConsole,
  logFieldsToConsole("name.first"),
  countMembersBy("location.state"),
  preStatesForMapping,
  save(sessionStorage, "map"),
  renderUSMap
);

getFakeMembers(100).then(loadAndMapMembers);
```

宣告式方式更可讀，因此容易理解。這些函式的實作細節被抽離。函式很好的命名並以描述會員資料如何進行載入、儲存與輸出的方式組合，這種方式無需大量註解說明。

基本上，宣告式程式設計產生較容易理解的應用程式，而應用程式容易理解時更容易放大規模。

接下來以建構或稱為 DOM 的文件物件模型任務為例。命令式方式會注意如何建構 DOM：

```javascript
var target = document.getElementById('target');
var wrapper = document.createElement('div');
var headline = document.createElement('h1');

wrapper.id = "welcome"
headline.innerText = "Hello World"

wrapper.appendChild(headline);
target.appendChild(wrapper);
```

此程式碼顧及建構元素、設定元素，並將其加入文件中。他很難修改、加入功能。或放大成
10000 行的命令式 DOM 建構程式碼

接著看看使用 React 元件以宣告式建構 DOM：

```javascript
const {render} = ReactDOM

const Welcome = () => (
  <div id="welcome">
    <h1>Hello World</h1>
  </div>
)

render(
  <Welcome/>,
  document.getElementById('target')
)
```

React 是宣告式的。此處的 Welcome 元件描述應該要繪製的 DOM。render
函式使用元件中宣告的指令來建構 DOM，抽離如何繪製 DOM
的細節。我們可以清楚地看到我們想要將 Welcome 元件繪製到 ID 為 'target' 的元素中。

## 函式性概念

介紹完“函式性”與“宣告性”之後，接下來假設函式性程式設計的核心概念：不變性、純度、資料轉換、高階函式與遞迴。

### 不變性

變即是修改，不變性就是不可改變。在函式性程式設計中，資料不可變。它絕不變化。

不可變資料的運作方式：相較於修改原始資料結構，製作該資料結構的副本並使用副本。會比較好，不動到原件。

為認識不變性如何運作，檢視它對修改資料的意義。

```javascript
let color_lawn = {
  title: "lawn",
  color: "#00FF00",
  rating: 0
}
```

建構對顏色評分的函式，並使用該函式改變 color 物件的評分：

```javascript
function rateColor(color, rating) {
  color.rating = rating;
  return color;
}

console.log(rateColor(color_lawn, 5).rating) // 5
console.log(color_lawn.rating)               // 5
```

在 JavaScript
中，函式參數是實際資料的參考。如此設定顏色的評分很不好，因為它改變原始顏色物件。我們可重寫
rateColor 函式以讓它不會動到原件 (color 物件)：

```javascript
var rateColor = function(color, rating) {
  return Object.assign({}, color, {rating:rating})
}

console.log(rateColor(color_lawn, 5).rating) // 5
console.log(color_lawn.rating)               // 4
```

我們使用 Object.assign 來改變顏色評分。Object.assign
是影印機；它拿一個空白物件複製顏色並修改它的評分。現在我們有個帶有新評分的顏色物件而無需改變原件。

我們能以 ES6 箭頭函式與 ES7 物件展開運算子撰寫相同函式：

```javascript
const rateColor = (color, rating) =>
  ({
    ...color,
    rating
  })
```