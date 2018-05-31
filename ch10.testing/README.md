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

若 store 可運行，你的應用程式很有可能可運行。測試 store 的程序涉及以 reducer 建構 store、插入想定狀態、分發 action，並檢驗結果。

測試 store 你可以整合 action 建構程序，並同時測試 store 與 action 建構程序。

第八章 storeFactory，它是顏色管理應用程式中管理 store 建構的函式：

```javascript
import {createStore, combineReducers, applyMiddleware} from "redux";
import {colors, sort} from './reducer';
import stateData from './initialState';

const logger = store => next => action => {
  let result;
  console.groupCollapsed("dispatching", action.type);
  console.log('prev state', store.getState());
  console.log('action', action);
  result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

const saver = store => next => action => {
  let result = next(action);
  localStorage['redux-store'] = JSON.stringify(store.getState());
  return result;
};

const storeFactory = (initialState = stateData) =>
  applyMiddleware(logger, saver)(createStore)(
    combineReducers({colors, sort}),
    (localStorage['redux-store']) ?
      JSON.parse(localStorage['redux-store']) :
      initialState
  );

export default storeFactory;
```

此模組匯出用於建構 store 的函式，它抽離建構 store 的細節。此檔案帶有 reducer、中介軟體，與建構 store 的預設狀態。以 storeFactory 建構 store 時可以選擇性的傳入初始狀態，這樣可幫助我們測試 store。

Jest 具有設定與分拆功能能在測試前後執行一些程式。

- beforeAll 與 afterAll 在執行測試組前後執行。
- beforeEach 與 afterEach 在 it 陳述執行前後呼叫

> Top! 設定與分拆  
> 撰寫測試時對每個測試只容許一個斷言是個好作法。這表示你想要在單一 it 陳述中避免多次呼叫 expect。這種方式讓每個斷言單獨檢驗，測試失敗時比較容易指出問題點。  
> Jest 的設定與分拆功能能幫助你遵循這種做法。在 beforeAll 陳述中執行測試程式碼並檢驗多個 it 陳述的結果

接下來看看如何測試 store 與 addColor 這個action 建構程序。

```javascript
import storeFactory from "../src/store";
import {addColor} from "../src/actions";

describe('addColor', function () {

  let store
  const colors = [
    {
      id: "8658c1d0-9eda-4a90-95e1-8001e8eb6036",
      title: "lawn",
      color: "#44ef37",
      timestamp: "Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)",
      rating: 4
    },
    {
      id: "f9005b4e-975e-433d-a646-79df172e1dbb",
      title: "ocean blue",
      color: "#0061ff",
      timestamp: "Mon Apr 11 2016 12:54:31 GMT-0700 (PDT)",
      rating: 2
    },
    {
      id: "58d9caee-6ea6-4d7b-9984-65b145031979",
      title: "tomato",
      color: "#ff4b47",
      timestamp: "Mon Apr 11 2016 12:54:43 GMT-0700 (PDT)",
      rating: 0
    }
  ];

  beforeAll(() => {
    store = storeFactory({colors});
    store.dispatch(addColor("Dark Blue", "#000033"));
  });

  it('should add a new color', function () {
    expect(store.getState().colors.length).toBe(4);
  });

  it('should add a unique guid id', function () {
    expect(store.getState().colors[3].id.length).toBe(36);
  });

  it('should set the rating to 0', function () {
    expect(store.getState().colors[3].rating).toBe(0);
  });

  it('should set timestamp', function () {
    expect(store.getState().colors[3].timestamp).toBeDefined();
  });
});
```

這裡使用兩個新的檢查程序：

- `.toBe`：使用 `===` 運算子比較結果，可用於比較數字或字串等原始型別，`.toEqual` 用於深度比較物件
- `.toBeDefined`：用於檢查變數或韓式是否存在

這些測試碼檢查 store 是否能使用 action 建構程序加入新顏色。

## 測試 React 元件

React 元件提供 React 於建構與管理 DOM 的更新時依循的指令。我們可透過繪製與檢查產生的 DOM 檢查這些元件。

我們不在瀏覽器中執行測試；我們從終端機與 Node.js 執行它們。Node.js 沒有瀏覽器的 DOM API。Jest 利用 jsdom 這個 npm 套件在 Node.js 中模擬瀏覽器環境，這是測試 React 元件的基礎。

### 設定 Jest 環境

Jest 提供執行測試前執行腳本的功能以讓我們設定測試時使用的全域變數。

舉例，若想要將 React 與一些顏色加入全域飯圍供測試存取，我們可以建構：

```javascript
// __tests__/global.js
import React from 'react';
import deepFreeze from 'deep-freeze';

global.React = React;
global._testColors = deepFreeze([
  {
    id: "8658c1d0-9eda-4a90-95e1-8001e8eb6036",
    title: "lawn",
    color: "#44ef37",
    timestamp: "Sun Apr 10 2016 12:54:19 GMT-0700 (PDT)",
    rating: 4
  },
  {
    id: "f9005b4e-975e-433d-a646-79df172e1dbb",
    title: "ocean blue",
    color: "#0061ff",
    timestamp: "Mon Apr 11 2016 12:54:31 GMT-0700 (PDT)",
    rating: 2
  },
  {
    id: "58d9caee-6ea6-4d7b-9984-65b145031979",
    title: "tomato",
    color: "#ff4b47",
    timestamp: "Fri Apr 15 2016 12:54:43 GMT-0700 (PDT)",
    rating: 0
  }
]);
```

此檔案將 React 與一些不可變測試加到全域範圍中。接下來，我們必須告訴 Jest 在執行測試前執行這個檔案。我們可以將 setupFiles 欄加入 package.json 中的 jest 節點：

```json
"jest": {
  "setupFiles": ["./__tests__/global.js"],
  "modulePathIgnorePatterns": ["global.js"]
}
```

setupFiles 欄提供測試前 Jest 應該執行以設定全域環境的檔案陣列。modulePathIgnorePatterns 欄告訴 Jest 執行測試時忽略 global.js 檔案，因為它沒有測試組；它是設定檔案。此欄為必要的是因為我們偏好將 global.js 檔案加入 `__tests__` 目錄，雖然它未帶有任何測試。

#### 略過 SCSS 匯入

若直接匯入 SCSS (或 CSS 與 SASS) 檔案到元件中，測試時必須略過這些匯入，若沒有略過它們，它們會導致測試失敗。

這些檔案可透過匯入 .css、.scss 或 .less 檔案時回傳空字串的模組對應程序略過。讓我們安裝 jest-css-modules：

```shell
$ npm i jest-css-modules --save-dev
```

安裝此套件後，我們必須告訴 Jest 使用此模組替換 .scss 的匯入。我們必須將 moduleNameMapper 欄加入：

```json
"jest": {
  ...
  "moduleNameMapper": {
    "\\.(scss)$": "<rootDir>/node_modules/jest-css-modules"
  }
}
```

它告訴 Jest 使用 jest-css-modules 模組替換結尾為 .scss 的匯入。將這幾行加到 package.json 檔案可防止測試因匯入 .scss 而出問題。

### Enzyme

我們差不多可以開始測試 React 元件了。開始撰寫我們的第一個元件測試前只要在安裝兩個 npm 模組：

```shell
$ npm i enzyme react-addons-test-utils --save-dev
```

Enzyme：是 Airbnb 設計的 React 元件測試工具。Enzyme 需要 react-addons-test-utils，它是測試過程中繪製元件以及與元件互動的一組工具。此外，還需要 react-dom，但我們假設你已經安裝。

Enzyme 讓繪製元件與遍歷繪製輸出更簡單。Enzyme 不是測試或斷言框架，它處理繪製 React 元件的測試工作並提供必要的工具供遍歷子元素、檢驗屬性、檢驗狀態、模擬事件與查詢 DOM。

Enzyme 有三個主要的繪製方法：

- **shallow**

  shallow 繪製一層元件供單元測試用

- **mount**

  mount 使用瀏覽器的 DOM 繪製元件，必須完整測試元件生命期與屬性或子元素狀態時使用

- **render**

  render 繪製靜態 HTML 與元件。你可以使用 render 檢驗元件是否回傳正確的 HTML

以 Star 元件為例：

```javascript
const Star = ({selected = false, onClick = f => f}) =>
  <div className={(selected) ? 'star selected' : 'star'}
       onClick={onClick}/>;
```

它應該繪製出一個 div 元素且 className 為選定的屬性。它還應該回應點擊事件。

讓我們使用 Enzyme 撰寫 Star 元件的測試。我們會使用 Enzyme 繪製該元件並找出繪製出的 Star 元件中的特定 DOM 元素。我們可使用 shallow 方法繪製一層元件：

> 筆者註：  
> react@15 請依照此步驟安裝相關 lib 跟 setup file 設定：
> [http://airbnb.io/enzyme/docs/installation/react-15.html](http://airbnb.io/enzyme/docs/installation/react-15.html)

```javascript
import {shallow} from 'enzyme';
import Star from "../../../src/components/ui/Star";

describe('<Star /> UI Component', () => {

  it('renders default star', function () {
    expect(
      shallow(<Star/>)
        .find('div.star')
        .length
    ).toBe(1);
  });

  it('renders selected stars', function () {
    expect(
      shallow(<Star selected={true}/>)
        .find('div.selected.star')
        .length
    ).toBe(1)
  });

});
```

Enzyme 有類似 jQuery 的函式。我們可使用 find 方法以 selector 語法查詢產生出的 DOM。

接下來，我們需要測試點擊事件。Enzyme
有工具可讓我們模擬事件並檢驗事件是否發生。對此測試需要一個檢驗 onClick
屬性是否正確的函式。我們需要一個模擬函式，而 Jest 有提供：

```javascript
it('invokes onClick', () => {

  const _click = jest.fn();

  shallow(<Star onClick={_click}/>)
    .find('div.star')
    .simulate('click')

  expect(_click).toBeCalled()

});
```

- `_click` 模擬函式以 jest.fn 建構
- Enzyme 的 simulate 方法模擬該元素的點擊事件
- toBeCalled 可用於檢驗模擬函式是否被叫用

Enzyme 可幫助我們繪製元件、找到繪製出的 DOM 元素或其他元件，並與其互動。

### 模擬元件

前面的測試引進模擬的概念：我們使用模擬函式測試 Star 元件。Jest 有工具幫助我們建構與插入各種模擬以撰寫更好的測試。模擬是重要的測試技巧，能夠幫助我們聚焦單元測試。模擬是測試時取代真正物件的物件。

在測試中，模擬物件看起來像真正的物件。

模擬的目的是讓你專注於受測元件或物件等 SUT。模擬用於取代 SUT 依靠的物件、元件或函式，這樣可以讓你檢驗 SUT 正確運作而無需動到相依內容。模擬讓你獨立與其他元件外分離、建構與測試功能。

#### 測試 HOC

模擬的用處之一是測試高階元件。HOC 透過屬性添加元件功能。我們可以建構模擬元件並傳給 HOC，以檢驗 HOC 添加了模擬的屬性。

以 Ch07 開發的 Expandable 的測試。為設定此 HOC 的測試，我們必須建構模擬元件並傳送給此 HOC。MockComponent 是用於取代真正元件的特技替身。

```javascript
import {mount} from 'enzyme';
import Expandable from '../../../src/components/HOC/Expandable';

describe('Expandable Higher-Order Component', () => {

  let props,
    wrapper,
    ComposedComponent,
    MockComponent = ({collapsed, expandCollapse}) =>
      <div onClick={expandCollapse}>
        {(collapsed) ? 'collapsed' : 'expanded'}
      </div>;

  describe('Rendering UI', function () {

  });

  describe('Expand Collapse Functionality', function () {

  });

});
```

MockComponent 只是就地開發的無狀態函式性元件，它回傳一個 div 與 onClick 處理程序供 expandCollapse 函式進行測試。展開或收起狀態也會在模擬元件中顯示。此元件只會用在這個測試中。

SUT 是 Expandable 這個 HOC。測試前，我們會以模擬呼叫 HOC 並檢查回傳元件，以確認套用了正確的屬性。

mount 韓式會取代 shallow 函式以檢查回傳元件的屬性與狀態：

```javascript
describe('Rendering UI', () => {

  beforeAll(() => {
    ComposedComponent = Expandable(MockComponent);
    wrapper = mount(<ComposedComponent foo="foo" gnar="gnar"/>);
    props = wrapper.find(MockComponent).props();
  });

  it('starts off collapsed', () => {
    expect(props.collapsed).toBe(true);
  });

  it('passes the expandCollapse function to composed component', () => {
    expect(typeof props.expandCollapse)
      .toBe('function')
  });

  it('passes additional foo prop to composed component', () => {
    expect(props.foo)
      .toBe('foo');
  });

  it('passes additional gnar prop to composed component', () => {
    expect(props.gnar)
      .toBe('gnar');
  });

});
```

使用 HOC 組合元件後，我們可以載入它並直接檢查屬性物件以檢驗組合元件有加入正確屬性。

接下來，讓我們檢驗 collapsed 屬性的改變：

```javascript
describe('Expand Collapse Functionality', () => {
  let instance

  beforeAll(() => {
    ComposedComponent = Expandable(MockComponent);
    wrapper = mount(<ComposedComponent collapsed={false}/>)
    instance = wrapper.instance();
  });

  it('renders the MockComponent as the root element', () => {
    expect(wrapper.first().is(MockComponent)); // first 取第一個子元素
  });

  it('starts off expanded', function () {
    expect(instance.state.collapsed).toBe(false);
  });

  it('toggles the collapsed state', () => {
    instance.expandCollapse();
    expect(instance.state.collapsed).toBe(true);
  });

});
```

載入元件後，我們可以使用 wrapper.instance 收集繪製實例的資訊。

wrapper 還有一些遍歷 DOM 的方法：

- wrapper.first 選取第一個子元素

HOC 適用模擬，因為插入模擬的程序很簡單：將它以參數傳送給 HOC。模擬個別元件的概念也一樣，但插入程序有點技巧。

#### Jest 的模擬

Jest 能讓你插入模擬到任何元件而不只是 HOC。使用 Jest 時，你可以模擬任何 SUT 匯入的模組。模擬能讓我們專注於 SUT 的測試而非其他可能導致問題的模組。

以 ColorList 元件為例，它匯入 Color 元件：

```javascript
import PropTypes from 'prop-types';
import Color from "./Color";
import '../../../stylesheets/ColorList.scss';


const ColorList = ({colors = [], onRemove = f => f, onRate = f => f}) => {
  return (
    <div className="color-list">
      {(colors.length === 0) ?
        <p>No Colors Listed. (Add a Color)</p> :
        colors.map(color =>
          <Color key={color.id}
                 {...color}
                 onRemove={() => onRemove(color.id)}
                 onRate={(rating) => onRate(color.id, rating)}/>
        )
      }
    </div>
  );
};

Color.propTypes = {
  colors: PropTypes.array
};

export default ColorList;
```

我們想要確保 ColorList 元件功能正常。我們不在乎 Color 元件；它有自己的單元測試。我們可以模擬取代 Color 元件：

```javascript
import {mount} from "enzyme";
import ColorList from "../../../src/components/ui/ColorList";

jest.mock('../../../src/components/ui/Color', () =>
  ({rating, onRate = f => f}) =>
    <div className="mock-color">
      <button className="rate" onClick={() => onRate(rating)}></button>
    </div>
);



describe('<ColorList /> UI Component', () => {

  describe('Rating a Color', () => {

    let _rate = jest.fn();

    beforeAll(() =>
      mount(<ColorList colors={_testColors} onRate={_rate}/>)
        .find('button.rate')
        .first()
        .simulate('click')
    );

    it('invokes onRate Handler', () => {
      expect(_rate).toBeCalled();
    });

    it('rates the correct color', () => {
      expect(_rate).toBeCalledWith(
        '8658c1d0-9eda-4a90-95e1-8001e8eb6036',
        4
      )
    });

  });

});
```

我們使用 jest.mock 將模擬插入實際 Color 元件的位置。傳給 jest.mock 的第一個參數是要模擬的模組，第二個參數是回傳模擬元件的函式。此例中，Color 的模擬是縮小版的 Color 元件。此測試只在乎顏色的評分，因此模擬只需要處理顏色評分相關的屬性。

此元件繪製出的 DOM 像是：

```javascript
<ColorList>
  <div className="color-list">
    <MockColor onRate={[Function]} rating={4}>
      <div className="mock-color">
        <button id="rate" onClick={[Function]}></button>
      </div>
    </MockColor>
    <MockColor onRate={[Function]} rating={2}>
      <div className="mock-color">
        <button id="rate" onClick={[Function]}></button>
      </div>
    </MockColor>
    <MockColor onRate={[Function]} rating={0}>
      <div className="mock-color">
        <button id="rate" onClick={[Function]}></button>
      </div>
    </MockColor>
  </div>
</ColorList>
```

這裡我們只在乎 ColorList，ColorList 的行為如同預期，點擊第一個顏色會將正確的評分傳給 onRate 屬性。

#### 手動模擬

Jest 能讓我們建構模組以使用模擬。相較於直接將模擬程式碼加入測試，每個模擬有一個 `__mocks__` 目錄供 Jest 尋找。

讓我們檢視 `/src/components/containers.js` 檔案。此檔案帶有三個容器。下一個測試會專注於 Colors 容器：

```javascript
import ColorList from "./ui/ColorList";

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

Colors 容器用於連接 store 資料與 ColorList 元件。它儲存狀態中的顏色並以屬性發送給 ColorList，還處理 ColorList 中的 onRate 與 onRemove 函式屬性。最後，此容器相依於 ColorList 模組。

將 `<Module>.js` 檔案加入 `__mocks__` 目錄以建構手動模擬。`__mocks__` 目錄帶有測試時取代真正模組的模擬模組。

以下舉例。請看 ColorList.js 這個模擬程式碼：

```javascript
// src/components/ui/__mocks__/ColorList.js
const ColorListMock = () => <div className="color-list-mock"></div>

ColorListMock.displayName = 'ColorListMock';

export default ColorListMock;
```

接下來以 jest.mock 模擬 `/src/components/ui/ColorList` 元件時，Jest 會從 `__mocks__` 目錄取得模擬。我們無須在測試中定義模擬。

除了手動模擬 ColorList 外，我們還建構了 store 模擬。store 有三個重要函式：

- dispatch
- subscribe
- getState

我們的模擬 store 也有這三個函式。getState 函式提供回傳樣本顏色狀態的模擬函式實作。

我們會使用這個模擬 store 來測試容器。我們以模擬 store 作為 store 屬性繪製 Provider 元件。我們的容器應該從該 store 取得顏色並傳送給模擬：

```javascript
import {mount} from "enzyme";
import {Provider} from "react-redux";
import {Colors} from "../../../src/components/containers";

jest.mock('../../../src/components/ui/ColorList');

describe('<Colors />', () => {

  let wrapper;
  const _store = {
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    getState: jest.fn(() =>
      ({
        sort: 'SORTED_BY_DATE',
        colors: _testColors
      })
    )
  };

  beforeAll(() => wrapper = mount(
    <Provider store={_store}>
      <Colors/>
    </Provider>
  ));

  it('renders three colors', () => {
    expect(wrapper
      .find('ColorListMock')
      .props()
      .colors
      .length
    ).toBe(3);
  });

  it('sorts the colors by date', () => {
    expect(wrapper
      .find('ColorListMock')
      .props()
      .colors[0]
      .title
    ).toBe('tomato');
  });

});
````

在此測試中我們呼叫 jest.mock 以模擬 ColorList 元件，但我們只傳送一個參數：被模擬模組的路徑。Jest 知道要從 `__mocks__` 目錄找尋模擬的實作。我們使用簡單的 ColorList 模擬元件。

再加入幾個測試確保 onRate 與 onRemove 正確運作：

```javascript
it('dispatches a REMOVE_COLOR action', () => {
  wrapper.find('ColorListMock')
    .props()
    .onRemove('f9005b4e-975e-433d-a646-79df172e1dbb');

  expect(_store.dispatch.mock.calls[0][0])
    .toEqual({
      id: 'f9005b4e-975e-433d-a646-79df172e1dbb',
      type: 'REMOVE_COLOR'
    });
});

it('dispatches a RATE_COLOR action', () => {
  wrapper.find('ColorListMock')
    .props()
    .onRate('58d9caee-6ea6-4d7b-9984-65b145031979', 5);

  console.log(_store.dispatch.mock.calls);

  expect(_store.dispatch.mock.calls[0][0])
    .toEqual({
      id: '58d9caee-6ea6-4d7b-9984-65b145031979',
      type: 'RATE_COLOR',
      rating: 5
    });
});
```

要測試 onRate 與 onRemove 無需實際模擬點擊，只需以一些資訊呼叫函式屬性並檢驗 store 的 dispatch 方法以正確的資料呼叫。此外，我們必須確保 dispatch 模擬在測試完成後重置。

能夠插入模擬到我們想要的測試的模組中是 Jest 的功能之一。模擬是讓測試專注於 SUT 的有效技巧。

## 快照測試

測試導向開發是測試函式、自定類別與資料庫非常好的方式，但測試 UI 時 TDD 通常不實用。UI 經常變化使得維護 UI 測試很花時間。為已經上線的 UI 元件撰寫測試也是很常見的任務。

快照測試提供快速測試 UI 元件以確保沒有引發任何預料外的改變。Jest 可儲存 UI 的快照並與測試的輸出進行比較，這能讓我們檢驗修改沒有意外效果且不會花太多時間在 UI 的測試上。

讓我們看看如何以快照測試檢驗 Color 元件。首先，讓我們看看 Color 元件現在程式碼：

```javascript
import PropTypes from 'prop-types';
import StarRating from "./StarRating";
import FaTrash from 'react-icons/lib/fa/trash-o';
import '../../../stylesheets/Color.scss'
import TimeAgo from "./TimeAgo";

const Color = ({id, title, color, rating = 0, timestamp, onRemove = f => f, onRate = f => f}) =>
  <section className="color">
    <h1>{title}</h1>
    <button onClick={() => onRemove(id)}>
      <FaTrash/>
    </button>
    <div className="color"
         style={{backgroundColor: color}}>
    </div>
    <TimeAgo timestamp={timestamp} />
    <div>
      <StarRating starsSelected={rating}
                  onRate={onRate}/>
    </div>
  </section>;

Color.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  rating: PropTypes.number,
  onRemove: PropTypes.func,
  onRate: PropTypes.func
};

export default Color;
```

若以特定的屬性繪製此元件，我們預期 DOM 會根據傳送的屬性帶有特定元件：

```javascript
shallow(
  <Color title="Test Color"
         color="#F0F0F0"
         rating={3}
         timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)"
  />
).html();
```

產生出的 DOM 應該像這樣：

```html
<section class="color">
  <h1>Test Color</h1>
  <button>
    <svg/>
  </button>
  <div class="color"
       style="background-color:#F0F0F0;">
  </div>
  <div class="time-ago">4/11/2016</div>
  <div>
    <div class="star-rating">
      <div class="star selected"></div>
      <div class="star selected"></div>
      <div class="star selected"></div>
      <div class="star"></div>
      <div class="star"></div>
      <p>3 of 5 stars</p>
    </div>
  </div>
</section>
```

快照測試能讓我們在第一次執行測試時儲存 DOM 的快照，然後我們能夠與後續測試進行比對以確保繪製結果相同。

讓我們開始撰寫 Color 元件的快照測試：

```javascript
import {shallow} from "enzyme";
import Color from "../../../src/components/ui/Color";

describe('<Color /> UI Component', () => {

  it('Renders correct properties', () => {

    let output = shallow(
      <Color title="Test Color"
             color="#F0F0F0"
             rating={3}
             timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)"
      />
    ).html();
    
    expect(output).toMatchSnapshot();

  });

});
```

此測試中，我們使用 Enzyme 繪製元件並收集輸出的 HTML 字串，.toMatchSnapshot 是 Jest 用於比較快照的程序。第一次執行此測試時，Jest 會將產生出的 HTML 儲存在快照檔案中。這個檔案會放在測試的 `__snapshots__` 目錄下。現在快照檔案看起來像這樣：

```javascript
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`<Color /> UI Component Renders correct properties 1`] = `"<section class=\\"color\\"><h1>Test Color</h1><button><svg fill=\\"currentColor\\" preserveAspectRatio=\\"xMidYMid meet\\" height=\\"1em\\" width=\\"1em\\" viewBox=\\"0 0 40 40\\" style=\\"vertical-align:middle;\\"><g><path d=\\"m15.9 16.4v12.9q0 0.3-0.2 0.5t-0.5 0.2h-1.4q-0.3 0-0.5-0.2t-0.2-0.5v-12.9q0-0.3 0.2-0.5t0.5-0.2h1.4q0.3 0 0.5 0.2t0.2 0.5z m5.7 0v12.9q0 0.3-0.2 0.5t-0.5 0.2h-1.4q-0.3 0-0.5-0.2t-0.2-0.5v-12.9q0-0.3 0.2-0.5t0.5-0.2h1.4q0.3 0 0.5 0.2t0.2 0.5z m5.8 0v12.9q0 0.3-0.2 0.5t-0.6 0.2h-1.4q-0.3 0-0.5-0.2t-0.2-0.5v-12.9q0-0.3 0.2-0.5t0.5-0.2h1.4q0.4 0 0.6 0.2t0.2 0.5z m2.8 16.2v-21.2h-20v21.2q0 0.5 0.2 0.9t0.3 0.6 0.2 0.2h18.6q0.1 0 0.2-0.2t0.4-0.6 0.1-0.9z m-15-24h10l-1.1-2.6q-0.1-0.2-0.3-0.3h-7.1q-0.2 0.1-0.4 0.3z m20.7 0.7v1.4q0 0.3-0.2 0.5t-0.5 0.2h-2.1v21.2q0 1.8-1.1 3.2t-2.5 1.3h-18.6q-1.4 0-2.5-1.3t-1-3.1v-21.3h-2.2q-0.3 0-0.5-0.2t-0.2-0.5v-1.4q0-0.3 0.2-0.5t0.5-0.2h6.9l1.6-3.8q0.3-0.8 1.2-1.4t1.7-0.5h7.2q0.9 0 1.8 0.5t1.2 1.4l1.5 3.8h6.9q0.3 0 0.5 0.2t0.2 0.5z\\"></path></g></svg></button><div class=\\"color\\" style=\\"background-color:#F0F0F0;\\"></div><div class=\\"time-ago\\">4/12/2016</div><div><div class=\\"star-rating\\"><div class=\\"star selected\\"></div><div class=\\"star selected\\"></div><div class=\\"star selected\\"></div><div class=\\"star\\"></div><div class=\\"star\\"></div><p>3 of 5 stars</p></div></div></section>"`;

```

接下來執行測試時 Jest 會比較輸出與快照。若產生出的 HTML 不同則測試失敗。

快照測試能讓我們快速前進，但若前進的太快，我們可能會寫出不穩定測試，或應該失敗的測試卻通過了。拍下 HTML 字串的快照可供測試，但我們很難確定快照是對的。讓我們將輸出儲存成 JSX 以改善快照。

為此，我們需要安裝 enzyme-to-json 模組：

```shell
$ npm i enzyme-to-json --save-dev
```

此模組提供將 Enzyme 包裝程序繪製成 JSX 功能，如此能更容易檢視快照輸出的正確性。

要使用 enzyme-to-json 繪製快照，我們先以 Enzyme 淺繪製 Color 元件，然後將結果傳給 toJSON 函式，再將 toJSON 的結果傳給 expect 函式。我們可能會想要寫出這樣的程式：

```javascript
expect(
  toJSON(
    shallow(
      <Color title="Test Color"
             color="#F0F0F0"
             rating={3}
             timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)"
      />
    )
  )
).toMatchSnapshot();
```

但此時非常適合組合來改善我們的程式碼。使用 Redux 的 compose 函式：

```javascript
import {shallow} from "enzyme";
import toJSON from 'enzyme-to-json';
import Color from "../../../src/components/ui/Color";
import {compose} from "redux";

describe('<Color /> UI Component', () => {

  const shallowExpect = compose(expect, toJSON, shallow);

  it('Renders correct properties', () => {
    shallowExpect(
      <Color title="Test Color"
             color="#F0F0F0"
             rating={3}
             timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)"
      />
    ).toMatchSnapshot();
  });

});
```

shallowExpect 函式淺繪製元件、轉換結果成 JSON，然後傳送給 expect 方法回傳所有 Jest 檢查程序。


執行此測試會失敗，因為現在輸出是 JSX 而非 HTML 字串。我們測試不再符合快照，但快照很容易更新。我們可以在執行測試時加上 updateSnapshot 旗標更新快照：

```shell
$ jest --updateSnapshot
```

若執行 Jest 時加上 watch 旗標：

```shell
$ jest --watch
```

Jest 會繼續在終端機執行並傾聽原始碼與測試的改變。若有改變，Jest 會重新執行測試。監視測試時，你可以按下 u 鍵更新快照。

更新後快照像是這樣：

```javascript
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`<Color /> UI Component Renders correct properties 1`] = `
<section
  className="color"
>
  <h1>
    Test Color
  </h1>
  <button
    onClick={[Function]}
  >
    <FaTrashO />
  </button>
  <div
    className="color"
    style={
      Object {
        "backgroundColor": "#F0F0F0",
      }
    }
  />
  <TimeAgo
    timestamp="Mon Apr 11 2016 12:54:19 GMT-0700 (PDT)"
  />
  <div>
    <StarRating
      onRate={[Function]}
      starsSelected={3}
    />
  </div>
</section>
`;
```

此快照更可讀。進行下一個測試前我們可以一眼就判斷結果正確。快照測試是加入應用程式測試的高效率方式。

## 使用程式碼涵蓋率

程式碼涵蓋率是報告有多少行程式碼實際測試過的程序，它提供一個度量可幫助你判斷是否有足夠的測試。

Jest 有個稱為 Istanbul 的 JavaScript 工具可計算測試並產生陳述、分支、函式與行數涵蓋的報告。

要執行 Jest 與涵蓋率，只需在執行 jest 命令時加上 coverage 旗標：

```shell
$ jest --coverage
```

程式碼報告會產生並顯示在終端機：

```
 PASS  __tests__/components/containers/Colors.test.js (5.073s)
 PASS  __tests__/components/ui/Color.test.js
 PASS  __tests__/components/ui/ColorList.test.js
 PASS  __tests__/components/ui/Star.test.js
 PASS  __tests__/actions.test.js
 PASS  __tests__/components/HOC/Expandable.test.js
 PASS  __tests__/store/reducers/color.test.js
--------------------|----------|----------|----------|----------|-------------------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
--------------------|----------|----------|----------|----------|-------------------|
All files           |    63.58 |    37.29 |    40.58 |    68.46 |                   |
 src                |    88.89 |      100 |       75 |    88.89 |                   |
  actions.js        |     87.5 |      100 |       75 |     87.5 |                27 |
  constants.js      |      100 |      100 |      100 |      100 |                   |
 src/components     |    58.33 |      100 |       40 |    58.33 |                   |
  containers.js     |    58.33 |      100 |       40 |    58.33 |    12,14,21,25,27 |
 src/components/HOC |      100 |      100 |      100 |      100 |                   |
  Expandable.js     |      100 |      100 |      100 |      100 |                   |
 src/components/ui  |    42.22 |       40 |       20 |    51.35 |                   |
  AddColorForm.js   |    16.67 |        0 |        0 |    18.18 |... 12,13,16,18,21 |
  Color.js          |       50 |    66.67 |       25 |       75 |                10 |
  ColorList.js      |    71.43 |       40 |       60 |      100 |               6,9 |
  SortMenu.js       |     37.5 |        0 |        0 |    42.86 |       11,14,18,19 |
  Star.js           |       75 |      100 |       50 |      100 |                   |
  StarRating.js     |    33.33 |        0 |        0 |       40 |             5,7,9 |
  TimeAgo.js        |       50 |      100 |        0 |       50 |                 4 |
 src/lib            |    58.54 |       15 |    16.67 |    67.65 |                   |
  array-helpers.js  |       60 |    33.33 |       60 |    71.43 |               6,8 |
  time-helpers.js   |    58.06 |        0 |        0 |    66.67 |... 38,43,45,49,54 |
 src/store          |    82.86 |    52.94 |    83.33 |    80.65 |                   |
  index.js          |      100 |    33.33 |      100 |      100 |             22,25 |
  reducer.js        |    64.71 |    57.14 |       60 |    64.71 | 21,33,34,37,38,48 |
--------------------|----------|----------|----------|----------|-------------------|

Test Suites: 7 passed, 7 total
Tests:       23 passed, 23 total
Snapshots:   1 passed, 1 total
Time:        10.004s
Ran all test suites.
```

此報告說明每個檔案有多少程式碼在測試過程中執行，並報告被測試匯入的所有檔案。

Jest 還產生可在瀏覽器中謢型的報告，它提供更多的程式碼涵蓋細節。你會發現執行 Jest 與涵蓋率後，目錄下面多了 cvoverage 目錄，從瀏覽器開啟 `/coverage/lcov-report/index.html`，它以互動報告顯示涵蓋率：

![](https://imgur.com/DUkpf1W.png)

這個報告告訴你涵蓋多少程式碼以及根據子目錄的個別涵蓋率。可深入子目錄檢視個別檔案。

ColorList 元件有相當好的測試。但在個別涵蓋率的部分，顯示了 onRemove 屬性還沒有測試過，讓我們加入一個測試組來測試：

```javascript
import {mount} from "enzyme";
import ColorList from "../../../src/components/ui/ColorList";

jest.mock('../../../src/components/ui/Color', () =>
  ({rating, onRate = f => f, onRemove = f => f}) =>
    <div className="mock-color">
      <button className="rate" onClick={() => onRate(rating)}></button>
      <button className="remove" onClick={onRemove}></button>
    </div>
);



describe('<ColorList /> UI Component', () => {

  // ...

  describe('Remove a Color', () => {

    let _remove = jest.fn();

    beforeAll(() =>
      mount(<ColorList colors={_testColors} onRemove={_remove}/>)
        .find('button.remove')
        .first()
        .simulate('click')
    );

    it('invokes onRemove Handler', () => {
      expect(_remove).toBeCalled();
    });

    it('remove the correct color', () => {
      expect(_remove).toBeCalledWith(
        '8658c1d0-9eda-4a90-95e1-8001e8eb6036'
      )
    });


  });

});
```

下一次產生涵蓋率報告將會看到改善。

不過我們沒有以空的顏色陣列繪製 ColorList。讓我們加入這個測試涵蓋：

```javascript
describe('Rendering UI', () => {

  it('Defaults properties correctly', () => {
    expect(shallow(<ColorList/>).find('p').text())
      .toBe('No Colors Listed. (Add a Color)')
  });

});
```

ColorList 元件的測試已經接近 100%。唯一還沒測試的是 onRate 與 onRemove 的預設函式。若我們沒提供這些函式，則屬性勢必要的。我們可以在沒有屬性下繪製 ColorList 元件以改善測試。我們還要模擬評分按鈕與刪除按鈕的點擊：

```javascript
describe('Rendering UI', () => {

  it('Defaults properties correctly', () => {
    expect(shallow(<ColorList/>).find('p').text())
      .toBe('No Colors Listed. (Add a Color)')
  });

  it('Clicking default rate button does not cause', () => {
    mount(<ColorList colors={_testColors}/>)
      .find('button.rate')
      .first()
      .simulate('click');
  });

  it('Clicking default remove button does not cause', () => {
    mount(<ColorList colors={_testColors}/>)
      .find('button.remove')
      .first()
      .simulate('click');
  });

});
```

下一次執行 Jest 與涵蓋率報告，ColorList 的涵蓋率到 100%。

但專案中的其餘元件還有很多工作要做。

你可以使用這個報告提升測試涵蓋的程式碼數量以幫助你改善測試。

你也可以在 package.json 檔案中加入涵蓋率選項：

```json
"jest": {
  "setupFiles": [
    "./__tests__/global.js"
  ],
  "modulePathIgnorePatterns": [
    "global.js"
  ],
  "moduleNameMapper": {
    "\\.(scss)$": "<rootDir>/node_modules/jest-css-modules"
  },
  "verbose": true,
  "collectCoverage": true,
  "notify": true,
  "collectCoverageFrom": ["src/**"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

- coverageThreshold 欄位定義測試通過前應該涵蓋多少程式碼
- collectCoverageFrom 欄位以 global 模式陣列指定涵蓋哪些檔案
- collectCoverage 設為 true 表示涵蓋率資料必須在每次對此專案執行 jest 命令時收集
- notify 欄位以作業系統的對話框顯示
- verbose 選項在每次執行 Jest 時顯示細節報告

  ```shell
   PASS  __tests__/components/ui/ColorList.test.js
    <ColorList /> UI Component
      Rating a Color
        ✓ invokes onRate Handler (6ms)
        ✓ rates the correct color (1ms)
      Remove a Color
        ✓ invokes onRemove Handler (1ms)
        ✓ remove the correct color
      Rendering UI
        ✓ Defaults properties correctly (3ms)
        ✓ Clicking default rate button does not cause (3ms)
        ✓ Clicking default remove button does not cause (3ms)
  ```

程式碼涵蓋率是評估測試很好的工具，它幫助你了解是否有足夠的單元測試。並非每個專案都要達到 100% 涵蓋，高於 85% 是不錯的目標。