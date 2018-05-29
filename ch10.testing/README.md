# Chap 10. 測試

為跟上競爭者，我們必須又快又好。讓我們又快又好的工具是**單元測試**。單元測試可檢驗應用程式的每個片段或單元。

函式性技術的一個好處是容易撰寫可測試的程式碼。純函式好測試，不可變容易測試。以特定功能的小函式組成應用程式會產出可測試的函式或程式單元。

這節示範可用於 React Redux 應用程式單元測試的技巧。不只討論測試，還討論幫助評估與改善程式碼與測試的工具。

## ESLint

JavaScript 並沒有對程式設計風格有嚴格的要求。我們撰寫程式、祈禱，並在瀏覽器中執行看看是否正確。好消息是有工具可分析程式碼以讓我們遵循特定格式規則。

分析 JavaScript 程式碼的程序稱為 hinting 或 linting。JSHint 與 JSLint 是分析
JavaScript 並提供格式報告的工具。ESLint 是支援 JavaScript
新語法的程式碼靜態分析工具。此外，ESLint
可加外掛。這表示我們可以建構並分享外掛以擴充 ESLint 的功能。

我們會使用 eslint-plugin-react 的外掛。此外掛會分析 JavaScript 以及 JSX 與
React 語法。

全域安裝 eslint。

```shell
$ npm i eslint -g
```

使用 ESLint
前，我們必須定義一些要遵循的組態規則。我們在位於專案根目錄的組態檔案中定義，此檔案可為
JSON 或 YAML 格式。YAML 是比較讓人看得懂的資料序列格式。

ESLint 有個工具可幫助我們設定組態。有些公司製作 ESLint 組態檔案可供我們使用，或也可以自行製作。

```shell
$ eslint --init
? How would you like to configure ESLint? Answer questions about your style
? Are you using ECMAScript 6 features? Yes
? Are you using ES6 modules? Yes
? Where will your code run? Browser
? Do you use CommonJS? Yes
? Do you use JSX? Yes
? Do you use React? Yes
? What style of indentation do you use? Spaces
? What quotes do you use for strings? Single
? What line endings do you use? Unix
? Do you require semicolons? No
? What format do you want your config file to be in? YAML

Local ESLint installation not found.
Installing eslint-plugin-react@latest, eslint@latest
```

`eslint --init` 執行後會發生三件事：

1. ESLint 與 eslint-plugin-react 被區域性的安裝在 ./node_modules 目錄中
2. 相依檔案自動加入 package.json
3. 建構出 eslintrc.yml 組態檔案並放在專案的根目錄

讓我們建構 sample.js 檔案以測試 ESLint 的組態：

```javascript
// sample.js
const gnar = "gnarly";

const info = ({file = __filename, dir = __dirname}) =>
  <p>{dir}: {file}</p>

switch (gnar) {
  default :
    console.log('gnarley')
    break
}
```

```shell
$ ./node_modules/.bin/eslint sample.js

/Users/eden.liu/Desktop/myProjects/learning-react/ch10.testing/color-organizer/sample.js
  1:14  error  Strings must use singlequote                  quotes
  1:22  error  Extra semicolon                               semi
  3:7   error  'info' is assigned a value but never used     no-unused-vars
  3:23  error  '__filename' is not defined                   no-undef
  3:41  error  '__dirname' is not defined                    no-undef
  4:1   error  Expected indentation of 4 spaces but found 2  indent
  7:1   error  Expected indentation of 0 spaces but found 2  indent
  8:5   error  Unexpected console statement                  no-console

✖ 8 problems (8 errors, 0 warnings)
  4 errors, 0 warnings potentially fixable with the `--fix` option.
```

- 只能用單引號且不能沒有分號
- info 並未使用
- __filename 與 __dirname 沒有自動的全域引用 Node.js
- switch 的縮排與 console 陳述

我們可以放寬標準：

```yaml
env:
  browser: true
  commonjs: true
  es6: true
extends: 'eslint:recommended'
parserOptions:
  ecmaFeatures:
    experimentalObjectRestSpread: true
    jsx: true
  sourceType: module
plugins:
  - react
rules:
  indent:
    - error
    - 2
    - SwitchCase: 1
  linebreak-style:
    - error
    - unix
  quotes:
    - error
    - single
  semi:
    - error
    - never
  no-console: 0
globals:
  __filename: true
  __dirname: true
```

我們還需要修改幾處以遵循我們的風格規則：

```javascript
const gnar = 'gnarly'

export const info = ({file = __filename, dir = __dirname}) =>
  <p>{dir}: {file}</p>

switch (gnar) {
  default :
    console.log('gnarley')
    break
}
```

再來重新測試，我們通過了

`eslint .` 命令會檢查整個目錄。這個做時你會要求 ESLint 略過幾個 JavaScript 檔案，你可在 .eslintignore 檔案加入要略過的檔案或目錄：

```
dist/assets/
sample.js
```

讓我們在 package.json 加入腳本以執行分析：

```json
"scripts": {
  "lint": "eslint ."
}
```

現在可用 `npm run lint` 執行 ESLint，它會分析專案下除了要略過的所有檔案。

## 測試 Redux

Redux 的測試是必要的，因為它只操作資料 —— 它沒有 UI。Redux 本來就可以測試，因為它的 reducer 是純函式且容易插入狀態到 store 中。為 store 與 action 建構程序撰寫測試可幫助你確認用戶端資料層運作如預期。

我們在這一節會撰寫一些顏色管理的 Redux 元件之單元測試：

### 測試驅動開發

是做法而非技術。並不是說只要測試應用程式，而是以測試推動開發。為實踐 TDD，你必須採取下列步驟：

- **先撰寫測試**

  這是最關鍵的步驟。先在測試中宣告要開發的東西與它的運作方式。

- **執行測試並看它失敗 (紅)**

  撰寫測試碼前先執行測試並看它失敗

- **撰寫通過測試的最小程式 (綠)**

  現在只需通過測試。專注於通過每個測試；不要加入測試範圍以外的功能

- **重構程式碼與測試 (金)**

  測試通過後，該是時候仔細檢查程式碼與測試。盡可能嘗試簡化與美化程式碼。

TDD 是開發 Redux 應用程式的好方式，如此能更容易在實際撰寫 reducer 前推斷它應該如何運作。實踐 TDD 能讓你獨立於 UI 外建構與驗證功能的資料結構或應用程式。

### 測試 reducer

reducer 是根據輸入參數計算與回傳結果的純函式。我們可在測試中控制輸入、目前狀態與 action。依目前狀態與 action，我們應該能夠預測 reducer 的輸出。

撰寫測試前需要安裝測試框架，你可以用任何 JavaScript 測試框架撰寫 React 與 Redux 的測試。我們會使用 Jest，它是依 React 設計的 JavaScript 測試框架：

```shell
$ npm i jest -g
```

這樣你可以在任何目錄下執行 jest 命令以執行測試。

由於我們使用新的 JavaScript 與 React，所以需要轉譯程式碼與測試。安裝 babel-jest 套件以供執行測試：

```shell
$ npm i --save-dev babel-jest
```

安裝 babel-jest 後，執行測試前程式碼與測試會以 Babel 轉譯。這需要一個 .babelrc 檔案，但專案的根目錄應該已經有一個 (create-react-app)

Jest 有兩個重要的測試設定函式：

- describe
- it

describe 用於建構測試組，而 it 用於每個測試。兩個函式都預期測試或測試組的名稱與帶有測試或測試組的 callback 函式。

```javascript
// ./__tests__/store/reducers/color.test.js
describe('color Reducer', () => {
  
  it('ADD_COLOR success');
  
  it('RATE_COLOR success');
  
});
```

此例建構 color 的 reducer 的測試組，為每個會影響 reducer 的 action 產生一段測試。每個測試以 it 函式定義。你可以只傳送一個參數給 it 函式以設定未決測試。

以 jest 命令執行此測試。Jest 會執行並報告它略過兩個未決測試：

```shell
$ jest

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        9.92s
Ran all test suites.
```

> Top! 測試檔案  
> Jest 會執行 `__tests__` 目錄下找到的所有測試與專案中副檔名為 .test.js 的 JavaScript 檔案。有些開發者偏好將測試直接放在受測檔案旁邊，而其他人偏好將測試集中在一個目錄下。

現在可以開始撰寫這些測試。color 的 reducer 函式是受測系統 (system under
test，SUT)。我們匯入此函式、傳送一個 action，並檢驗結果。

Jest 會以 expect 函式回傳的 “檢查程序” 檢查回傳結果。要測試的 color 的
reducer，我們會使用 .toEqual 這個檢查程序檢驗結果是否與傳給 .toEqual 的參數相符：

```javascript
import C from "../../../src/constants";
import {color} from "../../../src/store/reducer";

describe('color Reducer', () => {
  it('ADD_COLOR success', () => {
    const state = {};
    const action = {
      type: C.ADD_COLOR,
      id: 0,
      title: 'Test Teal',
      color: '#90C3D4',
      timestamp: new Date().toString()
    };
    const results = color(state, action);
    expect(results)
      .toEqual({
        id: 0,
        title: 'Test Teal',
        color: '#90C3D4',
        timestamp: new Date().toString(),
        rating: 0
      });
  });
  it('RATE_COLOR success', () => {
    const state = {
      id: 0,
      title: 'Test Teal',
      color: '#90C3D4',
      timestamp: 'Sat Mar 12 2016 16:12:09 GMT-0800 (PST)',
      rating: undefined
    };
    const action = {
      type: C.RATE_COLOR,
      id: 0,
      rating: 3
    };
    const results = color(state, action);
    expect(results)
      .toEqual({
        id: 0,
        title: 'Test Teal',
        color: '#90C3D4',
        timestamp: 'Sat Mar 12 2016 16:12:09 GMT-0800 (PST)',
        rating: 3
      })
  });
});
````

寫出測試後，假設我們還沒有寫成 color 的 reducer 程式碼，則需要空函式。我們可以在
`/src/store/reducers.js` 檔案中加上 color 函式。這能讓我們的測試找到空的
reducer 並匯入：

```javascript
import C from "../constants";

export const color = (state={}, action) => {
  return state;
}
```

讓我們執行測試並看它失敗。Jest 會提供失敗的細節，包括堆疊紀錄：

```shell
$ jest

 FAIL  __tests__/store/reducers/color.test.js
  color Reducer
    ✕ ADD_COLOR success (17ms)
    ✕ RATE_COLOR success (3ms)

  ● color Reducer › ADD_COLOR success

    expect(received).toEqual(expected)

    Expected value to equal:
      {"color": "#90C3D4", "id": 0, "rating": 0, "timestamp": "Tue May 29 2018 23:28:20 GMT+0800 (CST)", "title": "Test Teal"}
    Received:
      {}

    Difference:

    - Expected
    + Received

    - Object {
    -   "color": "#90C3D4",
    -   "id": 0,
    -   "rating": 0,
    -   "timestamp": "Tue May 29 2018 23:28:20 GMT+0800 (CST)",
    -   "title": "Test Teal",
    - }
    + Object {}

      14 |     const results = color(state, action);
      15 |     expect(results)
    > 16 |       .toEqual({
         |        ^
      17 |         id: 0,
      18 |         title: 'Test Teal',
      19 |         color: '#90C3D4',

      at Object.<anonymous> (__tests__/store/reducers/color.test.js:16:8)

  ● color Reducer › RATE_COLOR success

    expect(received).toEqual(expected)

    Expected value to equal:
      {"color": "#90C3D4", "id": 0, "rating": 3, "timestamp": "Sat Mar 12 2016 16:12:09 GMT-0800 (PST)", "title": "Test Teal"}
    Received:
      {"color": "#90C3D4", "id": 0, "rating": undefined, "timestamp": "Sat Mar 12 2016 16:12:09 GMT-0800 (PST)", "title": "Test Teal"}

    Difference:

    - Expected
    + Received

      Object {
        "color": "#90C3D4",
        "id": 0,
    -   "rating": 3,
    +   "rating": undefined,
        "timestamp": "Sat Mar 12 2016 16:12:09 GMT-0800 (PST)",
        "title": "Test Teal",
      }

      37 |     const results = color(state, action);
      38 |     expect(results)
    > 39 |       .toEqual({
         |        ^
      40 |         id: 0,
      41 |         title: 'Test Teal',
      42 |         color: '#90C3D4',

      at Object.<anonymous> (__tests__/store/reducers/color.test.js:39:8)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 2 total
Snapshots:   0 total
Time:        2.469s
Ran all test suites.
```

花時間撰寫測試與執行測試來觀察它們失敗以顯示測試如預期運行。失敗代表待辦事項，我們目標是讓雙方面成功通過。

撰寫通過測試所需的最少程式碼：

```javascript
// src/store/reducers.js
import C from '../constants';

export const color = (state = {}, action) => {
  switch (action.type) {
    case C.ADD_COLOR:
      return {
        id: action.id,
        title: action.title,
        color: action.color,
        timestamp: action.timestamp,
        rating: 0
      };
    case C.RATE_COLOR:
      state.rating = action.rating;
      return state;
    default:
      return state;
  }
};
```

接下來執行 jest 命令且測試應該成功：

```shell
$ jest

 PASS  __tests__/store/reducers/color.test.js
  color Reducer
    ✓ ADD_COLOR success (6ms)
    ✓ RATE_COLOR success (1ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.368s, estimated 2s
Ran all test suites.
```

成功，但還沒結束。接下來重構測試與程式碼。檢視 reducer 的 RATE_COLOR 的 case：

```javascript
case C.RATE_COLOR:
  state.rating = action.rating;
  return state;
```

仔細觀察，此程式碼有問題。狀態應該是不可變的，但我們改變了狀態物件的 rating 值。測試能夠通過是因為我們沒有確保狀態物件不可變。

deep-freeze 可幫助我們確保狀態與 action 物件維持不可變：

```shell
$ npm i deep-freeze --save-dev
```

呼叫 color 的 reducer 時，我們會凍結狀態與 action 物件。兩物件應該不可變，若測試改變物件則凍結它們導致錯誤：

```javascript
import C from "../../../src/constants";
import {color} from "../../../src/store/reducer";
import deepFreeze from 'deep-freeze';

describe('color Reducer', () => {
  it('ADD_COLOR success', () => {
    const state = {};
    const action = {
      type: C.ADD_COLOR,
      id: 0,
      title: 'Test Teal',
      color: '#90C3D4',
      timestamp: new Date().toString()
    };
    deepFreeze(state);
    deepFreeze(action);
    expect(color(state, action))
      .toEqual({
        id: 0,
        title: 'Test Teal',
        color: '#90C3D4',
        timestamp: new Date().toString(),
        rating: 0
      });
  });
  it('RATE_COLOR success', () => {
    const state = {
      id: 0,
      title: 'Test Teal',
      color: '#90C3D4',
      timestamp: 'Sat Mar 12 2016 16:12:09 GMT-0800 (PST)',
      rating: undefined
    };
    const action = {
      type: C.RATE_COLOR,
      id: 0,
      rating: 3
    };
    deepFreeze(state);
    deepFreeze(action);
    expect(color(state, action))
      .toEqual({
        id: 0,
        title: 'Test Teal',
        color: '#90C3D4',
        timestamp: 'Sat Mar 12 2016 16:12:09 GMT-0800 (PST)',
        rating: 3
      })
  });
});
```

現在來觀察測試的失敗，因為顏色評分會改變狀態：

```shell
$ jest

 FAIL  __tests__/store/reducers/color.test.js
  color Reducer
    ✓ ADD_COLOR success (7ms)
    ✕ RATE_COLOR success (11ms)

  ● color Reducer › RATE_COLOR success

    TypeError: Cannot assign to read only property 'rating' of object '#<Object>'

      12 |       };
      13 |     case C.RATE_COLOR:
    > 14 |       state.rating = action.rating;
         |       ^
      15 |       return state;
      16 |     default:
      17 |       return state;

      at color (src/store/reducer.js:14:7)
      at Object.<anonymous> (__tests__/store/reducers/color.test.js:41:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        1.703s, estimated 3s
Ran all test suites.
```

讓我們改變 color 的 reducer 以讓測試成功：

```javascript
case C.RATE_COLOR:
  return {
    ...state,
    rating: action.rating
  };
```

現在我們沒動到狀態，兩者都能通過：

```shell
$ jest

 PASS  __tests__/store/reducers/color.test.js
  color Reducer
    ✓ ADD_COLOR success (6ms)
    ✓ RATE_COLOR success

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.675s, estimated 2s
Ran all test suites.
```

此程序代表典型的 TDD
循環。我們撰寫測試、撰寫通過測試的程式碼、重構程式碼與測試。這種方式對 JavaScript
開發，特別是 Redux 很有效率。

### 測試 store