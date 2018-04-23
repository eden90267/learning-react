# Chap 02. JavaScript 新技術

## ES6 的變數宣告

### const

常數

### let

詞法變數範圍。在 JavaScript 以 `{}` 建構程式區段，函式的大括弧限制變數範圍。

可使用 let 關鍵字指定變數範圍給任何程式區塊。使用 let 保護全域變數的值。

另一個大括弧不會遮擋變數範圍的地方是 for 迴圈。

```javascript
var div, container = document.getElementById('container');

for (var i = 0; i < 5; i++) {
  div = document.createElement('div');
  div.onclick = function() {
    alert('This is box #' + i);
  };
  container.appendChild(div);
}
```

警示對話框均會顯示所有的 div 的 i 等於 5，因為全域的 i 目前的值為 5。

以 let 而非 var 宣告迴圈計數器 i 會遮擋 i 的範圍。現在點擊任何方塊會顯示出 i 的值範圍限制在迴圈迭代中。

```javascript
var div, container = document.getElementById('container');

for (let i = 0; i < 5; i++) {
  div = document.createElement('div');
  div.onclick = function() {
    alert('This is box #' + i);
  };
  container.appendChild(div);
}
```

## 模板字串

```javascript
console.log(`${lastName}, ${firstName} ${middleName}`);
```

模板字串會維持空白，能夠製作郵件樣板、程式碼範例或其他帶有空白的東西。現在你可以製作跨多行而不會破壞程式碼的字串。

## 預設參數

C++ 與 Python 等語言允許開發者宣告函式參數的預設值。參數預設值包含在 ES6 中，因此在沒有提供參數值時會使用預設值。

```javascript
function logActivity(name = "shane McConkey", activity = "skiing") {
  console.log(`${name} loves ${activity}`);
}
```

預設參數可以是任何型別，而非只能是字串。

## 箭頭函式

```javascript
var lordify = firstname => `${firstname} of Canterbury`
```

分號若不是必要就不使用。本書盡量排除不必要的語法。

- 使用箭頭讓整個函式宣告放在一行。function 關鍵字被拿掉。我們還拿掉
  return，因為箭頭指向要回傳的東西
- 若函式只有一個參數，我們可拿掉包圍參數的括號
- 超過一行陳述式必須以大括號包圍
- 箭頭函式不會遮擋 this。舉例：

  ```javascript
  var tahoe = {
    resorts: ["kirkwood", "Squaw", "Alpine", "Heavenly", "Northstar"],
    print: function(delay=1000) {
      setTimeout(function() {
        console.log(this.resorts.join(","))
      }, delay)
    }
  }
  
  tahoe.print(); // 無法讀取 undefined 的 'join' 屬性
  ```

  會拋出這錯誤是因為它嘗試對 this 使用 .join 方法。此例中，它是 window
  物件。另外，我們可使用箭頭函式語法來保護 this 範圍。

  ```javascript
  var tahoe = {
    resorts: ["kirkwood", "Squaw", "Alpine", "Heavenly", "Northstar"],
    print: function(delay=1000) {
      setTimeout(() => {
        console.log(this.resorts.join(", "))
      }, delay)
    }
  }
  
  tahoe.print(); // kirkwood, Squaw, Alpine, Heavenly, Northstar
  ```

  它正確執行並可以使用逗號作 .join。但要注意範圍，箭頭函式不會遮擋 this 的範圍。

  ```javascript
  var tahoe = {
    resorts: ["kirkwood", "Squaw", "Alpine", "Heavenly", "Northstar"],
    print: (delay=1000) => {
      setTimeout(() => {
        console.log(this.resorts.join(","))
      }, delay)
    }
  }
  
  tahoe.print(); // 無法讀取 undefined 的 resorts
  ```

  修改箭頭函式的 print 函式表示 this 是 window

  改正他就是 print 使用一般函式。

## 轉譯 ES6

最常見的轉譯工具是 Babel。現在透過轉譯可立即使用最新的 JavaScript
功能。轉譯非編譯，不是轉譯二進位，相對的，它被轉譯成各種瀏覽器可解譯的語法。


你可以在瀏覽器中直接使用 Babel 轉譯器進行 JavaScript 的轉譯。只需引用
browser.js 檔案，任何 type="text/babel" 的腳本會被轉換 (只有 CDN 的 Babel 5
可執行)

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.js"></script>
<script src="script.js" type="text/babel"></script>
```

在瀏覽器中轉譯，這不適合實際上線運作。因為會大幅拖慢應用程式。

## ES6 物件與陣列

ES6 提供運用物件與陣列以及這些資料集的變數範圍設定的新方式。這些功能包括：

- 解構賦值
- 物件實字加強
- 展開運算子

### 解構賦值

解構賦值允許你設定物件欄位的區域範圍並宣告使用哪些值。

```javascript
var sandwich = {
  bread: "dutch crunch",
  meat: "tuna",
  cheese: "swiss",
  toppings: ["lettuce", "tomato", "mustard"]
}

var {bread, meat} = sandwich;

console.log(bread, meat); // dutch crunch tuna
```

此程式從物件擷取 bread 與 meat 並加以建構區域變數。

我們也可解構函式參數。下面函式會輸出姓名與領地：

```javascript
var regularPerson = {
  firstname: "Bill",
  lastname: "Wilson"
}

var lordify = ({firstname}) => {
  console.log(`${firstname} of Canterbury`);
}

lordify(regularPerson);
```

解構更為宣告性，這表示程式碼更能說明我們的目的。透過解構
firstname，我們宣告只需要使用 firstname 變數。下一章會進一步討論宣告性程式設計。

值也可從陣列中解構。假設我們想要指派陣列的第一個值給一個變數：

```javascript
var [firstResort] = ["Kirkwood", "Squaw", "Alpine"];

console.log(firstResort); // kirkwood
```

```javascript
var [,,thirdResort] = ["Kirkwood", "Squaw", "Alpine"] // alpine
```

### 物件實字的加強

物件實字的加強與解構相反。他是重構或重新結合的程序。我們可透過物件實字的加強從全域範圍擷取變數並將其轉換成物件。

```javascript
var name = "Tallac"
var elevation = 9738
var print = function() {
  console.log(`Mt. ${this.name} is ${this.elevation} feet tall`)
}

var funHike = {name, elevation}

console.log(funHike); // {name: "Tallac", elevation: 9738}
```

請注意，我們以 this 存取物件的鍵。

定義物件的方法不再需要使用 function 關鍵字

```javascript
const skier = {
  name,
  sound,
  powderYell() {
    let yell = this.sound.toUpperCase()
    console.log(`${yell} ${yell} ${yell}!!!`)
  },
  speed(mph) {
    this.speed = mph
    console.log('speed:', mph)
  }
}
```

物件實字加強可讓我們提取全域變數到物件中並省略 function 關鍵字而減少輸入

### 展開運算子

展開運算子是執行不同工作的三個點(...)。

首先，展開運算子能讓我們結合內容與陣列。

```javascript
var peaks = ["Tallac", "Ralston", "Rose"];
var canyons = ["Ward", "Blackwood"];
var tahoe = [...peaks, ...canyons];

console.log(tahoe.join(', ')); // Tallac, Ralston, Rose, Ward, Blackwood
```

假設我們要擷取陣列的最後而非第一個元素，可使用 array.reverse 方法反轉陣列並結合陣列解構：

```javascript
var peaks = ["Tallac", "Ralston", "Rose"];
var [last] = peaks.reverse();

console.log(last); // Rose
console.log(peaks.join(', ')); // Rose, Ralston, Tallac
```

看到嗎？reverse 函式改變了陣列。使用展開運算子時，我們無須改變原始陣列；我們可以建構該陣列的副本然後將其反轉：

```javascript
var peaks = ["Tallac", "Ralston", "Rose"];
var [last] = [...peaks].reverse();

console.log(last); // Rose
console.log(peaks.join(', ')); // Tallac, Realston, Rose
```

由於我們使用展開運算子複製陣列，peaks 陣列還是維持原狀並在之後以原狀操作

展開運算子也可用於取得部份或其他陣列元素：

```javascript
var lakes = ["Donner", "Marlette", "Fallen Leaf", "Cascade"]
var [first, ...rest] = lakes

console.log(rest.join(', ')); // Marlette, Fallen Leaf, Cascade
```

也可使用展開運算子搜集函式的測試作為陣列。下列函式以展開運算子取用 n 個參數，然後輸出一些訊息：

```javascript
function directions(...args) {
  var [start, ...remaining] = args
  var [finish, ...stops] = remaining.reverse()
  
  console.log(`drive through ${args.length} towns`)
  console.log(`start in ${start}`)
  console.log(`the destination is ${finish}`)
  console.log(`stopping ${stops.length} times in between`)
  
  directions(
    "Trickee",
    "Tahoe City",
    "Sunnyside",
    "Homewood",
    "Tahoma"
  )
}
```

展開運算子也可用於物件，對物件使用展開運算子如同陣列的操作。以下是我們使用與結合兩個陣列成為第三個陣列相同的方式，但操作物件而非陣列：

```javascript
var morning = {
  breakfast: "oatmeal",
  lunch: "peanut butter and jelly"
}

var dinner = "mac and cheese"

var backpackingMeals = {
  ...morning,
  dinner
}

console.log(backpackingMeals) // {breakfast: "oatmeal",
                              // lunch: "peanut butter and jelly",
                              // dinner = "mac and cheese"}
```

## Promise

Promise
提供合理的非同步行為。發出非同步的請求時有兩種可能：正常與錯誤。正常與錯誤的情況有很多種。舉例來說，我們有多種方式可成功取得資料。我們也會收到不同類型的錯誤。Promise 可將其簡化為簡單的成功或失敗。

```javascript
const getFakeMembers = count => new Promise((resolves, rejects) => {
  const api = `https://api.randomuser.me/?nat=US&results=${count}`
  const request = new XMLHttpRequest()
  request.open('GET', api)
  request.onload = () =>
      (request.status === 200) ?
      resolves(JSON.parse(request.response).results) :
      rejects(Error(request.statusText))
  request.onerror = (err) => rejects(err)
  request.end
})

getFakeMembers(5).then(
  members => console.log(members),
  err => console.error(
    new Error("cannot load members from randomuser.me")
  )
)
```

深入認識它是 JavaScript 工程師的必要條件。

## 類別

之前 JavaScript 沒有正式類別，型別以函式定義。我們必須建構函式，然後以 prototype
定義函式物件的方法：

```javascript
function Vacation(destination, length) {
  this.destination = destination
  this.length = length
}

Vacation.prototype.print = function() {
  console.log(this.destination + "|" + this.length + "day")
}

var maui = new Vacation("Maui", 7);

maui.print(); // Maui | 7
```

若你習慣傳統的物件導向，這或許會讓你抓狂。

ES6 引進類別宣告，但 JavaScript 還是以相同方式運作。函式是物件，繼承透過
prototype 處理，但這樣的語法對傳統物件導向來說更為合理：

```javascript
class Vacation {
  
  constructor(destination, length) {
    this.destination = destination
    this.length = length
  }
  
  print() {
    console.log(`${this.destination} will take ${this.length} day.`)
  }
  
}

const trip = new Vacation("Santiago, Chile", 7);

console.log(trip.print()); // Santiago, Chile will take 7 days.
```

建構類別物件後，你可以用它建構多個新實例。類別也可以擴充，擴充類別時，子類別繼承父類別的屬性與方法。這些屬性與方法可從子類別操作，預設上所有東西都會被繼承。

你可使用 Vacation 作為抽象類別來建構不同類型的假期。舉例：

```javascript
class Expedition extends Vacation {
  
  constructor(destination, length, gear) {
    super(destination, length)
    this.gear = gear
  }
  
  print() {
    super.print();
    console.log(`Bring your ${this.gear.join(" and your ")}`)
  }
}
```

這是一個簡單的繼承：子類別繼承父類別的屬性。呼叫 Vacation 的 printDetails
方法可添加一些新的內容到 Expedition 的 printDetails 輸出中。

```javascript
const trip = new Expedition("Mt. whitney", 3, ["sunglasses", "prayer flags", "camera"])

trip.print()
```

本書會使用類別，但我們要強調的是函式性作法。類別有其他功能，例如 getter、setter
與靜態方法，但本書偏好函式性技術而物件導向技術。介紹它們的目的是因為稍後建構 React
元件時會用到。

## ES6 模組

JavaScript 的模組是一段其他 JavaScript 檔案可重複使用的程式碼。現在 ES6 本身已經支援模組。

JavaScript
模組儲存於獨立的檔案中，每個檔案為一個模組。建構與匯出模組時有兩個選項：你可以從單一模組繪出多個
JavaScript 物件，或每個模組一個 JavaScript 物件。

以下匯出模組與兩個函式

```javascript
// ./test-helpers.js
export const print = (message) => log(message, new Date());

export const log = (message, timestamp) => console.log(`${timestamp.toString()}: ${message}`)
```

export 用於匯出其他模組使用的 JavaScript 型別。此例中的 print 函式與 log
函式被匯出。宣告 test-helpers.js 的其他變數是該模組的區域變數。

有時你會只從模組匯出一個變數。在這情況下你可使用 export default

```javascript
const freel = new Expedition("Mt. Freel", 2, ["water", "snack"]);

export default freel;
```

只想要匯出一個型別時可用 export default 取代 export。export 與 export
default 可用於任何 JavaScript 型別：原始、物件、陣列與函式。

其他 JavaScript 檔案可使用 import
陳述運用模組。具有多個匯出的模組可利用物件解構。使用 export default 的模組會匯入到單一變數中：

```javascript
import {print, log} from './text-helpers'
import freel from './mt-freel'

print('printing a message')

log('logging a message')

freel.print()
```

你可在區域範圍內用不同變數名稱設定模組變數：

```javascript
import {print as p, log as l} from './text-helpers'

p('printing a message')
l('logging a message')
```

你也可使用 * 匯入所有東西到單一變數中：

```javascript
import * as fns from './text-helpers'
```

ES6 模組還未被所有瀏覽器支援。Babel 有支援 ES6 模組。本書會使用它們。

## CommonJS

CommonJS 是所有 Node.js 版本支援的模組模式。你還是可在 Babel 與 webpack
中使用這些模組。

```javascript
const print = (message) => log(message, new Date());

const log = (message, timestamp) => console.log(`${timestamp.toString()}: ${message}`)

module.exports = {
  print,
  log
}
```

CommonJS 並不支援 import 陳述，相對的，模組以 require 函式匯入：

```javascript
const {log, print} = require('./text-helpers')
```

ES6 規格中的許多功能會被納入是因為他們支援函式性程式語言技術。函式性 JavaScript 中，我們可以將程式碼視為一群應用程式可使用的函式的集合。下一章會更深入討論函式性技術與為何要使用它們。