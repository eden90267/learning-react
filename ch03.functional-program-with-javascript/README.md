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

使用箭頭函式不能指向物件的大括弧。

以顏色名稱的陣列為例：

```javascript
let list = [
  {title: "Rad Red"},
  {title: "Lawn"},
  {title: "Party Pink"}
]
```

我們可用 Array.push 建構新增顏色到該陣列的函式

```javascript
var addColor = function(title, colors) {
  colors.push({title: title});
  return colors;
}

console.log(addColor("Glam Green", list).length);
console.log(list.length);
```

但 Array.push 不是不可變函式。我們必須改用 Array.concat：

```javascript
const addColor = (title, array) => array.concat({title});

console.log(addColor("Glam Green", list).length);
console.log(list.length);
```

Array.concat 連接陣列。此例中，它將新物件與新顏色加入原始陣列的副本中。

你也可使用 ES6 展開運算子以用於副本物件的相同方式連接陣列

```javascript
const addColor = (title, list) => [...list, {title}]
```

此函式複製原始的清單到新陣列中並加入新顏色物件到副本中。它是不可變的。

### 純函式

純函式是依參數計算回傳值的函式。純函式至少有一個參數並回傳值或另一個函式。它們沒有副作用、不改變全域變數或應用程式狀態。它們視參數為不可變資料。

此為一個不純函式：

```javascript
var frederick = {
  name: "Frederick Douglass",
  canRead: false,
  canWrite: false
}

function selfEducate() {
  frederick.canRead = true
  frederick.canWrite = true
  return frederick
}

selfEducate()
console.log(frederick)
```

selfEducate
函式不是純函式。它沒有任何參數且不回傳值或函式。它還會改變範圍外的變數：Frederick。叫用
selfEducate 函式後，“世界” 發生了一些變化，它產生了副作用。

```javascript
const frederick = {
  name: "Frederick Douglass",
  canRead: false,
  canWrite: false
}

const selfEducate = (person) => {
  person.canRead = true
  person.canWrite = true
  return person
}

console.log(selfEducate(frederick))
console.log(frederick)
// {name: "Frederick Douglass", canRead: true, canWrite: true}
// {name: "Frederick Douglass", canRead: true, canWrite: true}
```

> Tip！ 純函式可測試：測試純函式時，你控制參數並可評估結果。

selfEducate
函式是不純的：它會產生副作用。叫用此函式會改變傳給它的物件。若我們能將傳給此函式的參數視為不可變資料，則可得到一個純函式。

```javascript
const frederick = {
  name: "Frederick Douglass",
  canRead: false,
  canWrite: false
}

const selfEducate = (person) => ({
  ...person,
  canRead: true,
  canWrite: true
})

console.log(selfEducate(frederick))
console.log(frederick)
// {name: "Frederick Douglass", canRead: true, canWrite: true}
// {name: "Frederick Douglass", canRead: false, canWrite: false}
```

此版本的 selfEducate 終於變成純函式。

接著檢視一個改變 DOM 的不純函式：

```javascript
function Header(text) {
  let h1 = document.createElement('h1');
  h1.innerText = text;
  document.body.appendChild(h1);
}

Header("Header() caused side effects");
```

此函式沒有回傳函式或值，且有副作用：改變 DOM。

在 React 中，UI 以純函式表示。

```javascript
const Header = (props) => <h1>{props.title}</h1>
```

此函式沒有副作用，因為它不改變
DOM。此函式會建構一個標頭元素，由應用程式的其他部分改變 DOM。

純函式是函式性程式設計的另一個核心概念。它們使得事情變得簡單，因為它們不會影響應用程式的狀態。撰寫函式時，嘗試依循下列三個規則：

1. 函式應該至少取用一個參數
2. 函式一個回傳一個值或其他函式
3. 函是不應該改變或轉換任何參數

### 資料轉換

函式性程式設計與轉換資料有關。我們會使用函式產生轉換過的副本。這些函式讓我們的程式較不命令式而因此減少複雜性。

你無須特殊的架構以理解如何根據資料集產生另一個資料集。JavaScript
有內建必要的工具。你必須熟悉兩個核心函式以便運用函式性 JavaScript:：Array.map 與 Array.reduce。

以下列高中陣列為例：

```javascript
const schools = [
  "Yorktown",
  "Washington & Lee",
  "Wakefield"
]
```

我們可使用 Array.join 函式獲得以逗號分隔的字串：

```javascript
console.log(schools.join(", "))
// Yorktown, Washington & Lee, Wakefield
```

原始陣列還是維持原狀；join 只是提供另一種看法。如何產生字串的細節對程式設計師是抽離的。

要撰寫製作以“W”開頭的高中之新陣列函式，我們可使用 Array.filter 方法：

```javascript
const wSchools = schools.filter(school => school[0] === W)

console.log(wSchools);
// ["Washington & Lee", "Wakefield"]
```

此函式以**述詞**作為唯一的參數。述詞是回傳布林值的函式。Array.filter
對陣列的每一個元素叫用述詞一次。元素作為參數傳給述詞並回傳判斷是否加入新陣列的值。

要從陣列移除元素時應該使用 Array.filter 而非 Array.pop or Array.splice，因為
Array.filter 是不可變的。

```javascript
const cutSchool = (cut, list) =>
  list.filter(school => school !== cut)

console.log(cutSchool("Washington & Lee", schools).join(" * "));

// "Yorktown * Wakefield"

console.log(schools.join("\n"));

// Yorktown
// Washington & Lee
// Wakefield
```

另一個函式性程式設計的基本陣列是 Array.map。相較於述詞，Array.map 方法取用一個函式作為參數。此函式會以陣列每個元素呼叫一次，回傳結果會加入新陣列：

```javascript
const highSchools = schools.map(school => `${school} High School`);
```

map 函式用於添加 "High School" 到每個學校名稱後面。schools 陣列還是維持原狀。

下一個範例從一個字串陣列產生另一個字串陣列。map
函式可產生物件、值、陣列，或其他函式——任何 JavaScript 型別的陣列。

```javascript
const highSchools = schools.map(school => ({name: school}))

console.log(highSchools);

// [
//    {name: "Yorktown"},
//    {name: "Washington & Lee"},
//    {name: "Wakefield"}
// ]
```

它以字串陣列產生物件陣列。

若需要建構改變物件陣列中的一個物件的純函式也可使用 map。

```javascript
const editName = (oldName, name, arr) =>
  arr.map(item => (item.name === oldName) ? 
      ({...item, name}) : 
      item
  )

let schools = [
  {name: "Yorktown"},
  {name: "Stratford"},
  {name: "Washington & Lee"},
  {name: "Wakefield"}
]

let updatedSchools = editName("Stratford", "HB Woodlawn", schools);

console.log(updatedSchools[1]); // { name: "HB Woodlawn" }
console.log(schools[1]);        // { name: "Stratford" }
```

若需要轉換陣列成物件，你可使用 Array.map 與 Object.keys。Object.keys 是從物件回傳鍵陣列的方法。

假設我們要將 schools 物件轉換成學校陣列：

```javascript
const schools = {
  "Yorktown": 10,
  "Washington & Lee": 2,
  "Wakefield": 5
}

const schoolArray = Object.keys(schools).map(key =>
  ({
    name: key,
    wins: schools[keys]
  }))

console.log(schoolArray);

// [
//   {
//     name: "Yorktown",
//     wins: 10
//   },
//   // ...
// ]

```

此例中，Object.keys 回傳學校名稱的陣列，我們可以對該陣列使用 map
產生相同長度的新陣列。

我們學到了 Array.map、Array.filter 轉換陣列，以 Object.keys 與 Array.map
陣列轉物件。最後一個，我們可運用的函式性工具可轉換陣列成原始值與其他物件。

reduce 與 reduceRight 韓式可用於轉換陣列成任何值，包括數字、字串、布林、物件，甚至是函式。

假設我們需要找出數字陣列中的最大數字。我們必須將陣列轉換成數字：因此可用 reduce：

```javascript
const ages = [21,18,42,40,64,63,34];

const maxAge = ages.reduce((max, value) => (value > max) ? value : max, 0);

console.log(maxAge); // 64
```

reduce 有兩個參數：callback 函式與原始值。

Array.reduceRight 的運作與 Array.reduce 相同；差別是從陣列後面而非前面開始。

有時候我們需要將陣列轉換成物件。下面範例使用 reduce 將顏色陣列轉換成雜湊：

```javascript
const colors = [
  {
    id: '-xekare',
    title: "rad red",
    rating: 3
  },
  {
    id: '-jbwsof',
    title: "big blue",
    rating: 2
  },
  {
    id: '-prigbj',
    title: "grizzly grey",
    rating: 5
  },
  {
    id: '-ryhbhsl',
    title: "banana",
    rating: 1
  }
]

const hashColors = colors.reduce((hash, {id, title, rating}) => {
  hash[id] = {title, rating}
  return hash
}, {});

console.log(hashColors);
// {
//   "xekare": {
//     title: "rad red".
//     rating: 3
//   },
//   "jbwsof": {
//     title: "big blue",
//     rating: 2
//   }
//   // ...
// }
```

每一輪中，callback 函式使用方括號記號法對雜湊加入新的鍵，並設定鍵對應的值為陣列的
id 欄位。Array.reduce 能以這種方式將陣列減為單一值——此例中是一個物件。

我們甚至可以用 reduce
將陣列轉換成完全不同的陣列。要將具有多個相同值的元素的陣列轉換成元素均為不同值的陣列時，可使用
reduce 方法。

```javascript
const colors = ["red", "red", "green", "blue", "green"];

const distinctColors = colors.reduce(
  (distinct, color) =>
    distinct.indexOf(color) !== -1 ? distinct : [...distinct, color]
,[])

console.log(distinctColors);
```

map 與 reduce 是函式性程式設計師的武器，JavaScript 也不例外。若想要成為
JavaScript 專家，你必須熟練這些函式。從一個資料級建構另一個資料級的能力是必要條件，且對任何類型的程式設計方式都很有用。

### 高階函式

使用**高階函式**也是函式性程式設計的基礎。高階函式是能夠操作其他函式的函式，它們可取用函式作為參數或回傳函式。

第一類高階函式是預期函式參數的函式。Array.map、Array.filter 與 Array.reduce
都以函式作為參數，它們是高階函式。

來看一下如何實作高階函式。在下面範例中，我們建構 invokeIf 這個 callback
函式，它測試一個條件並視結果呼叫 callback 函式：

```javascript
const invokeIf = (condition, fnTrue, fnFalse) =>
    condition ? fnTrue() : fnFalse()
    
const showWelcome = () =>
    console.log("Welcome")
    
const showUnauthorized = () =>
    console.log("Unauthorized!!!")
    
invokeIf(true, showWelcome, showUnauthorized);
invokeIf(false, showWelcome, showUnauthorized);
```

回傳其他函式的高階函式可以幫助我們處理 JavaScript 中非同步的複雜性。它們可以幫助我們建構可方便重複使用的函式。

柯里化 (currying)
是一種涉及高階函式的函式性技術，柯里化維持一些完成一個操作所需要的值直到稍後取得其餘值為止。它透過使用回傳另一個科里化函式的函式進行。

