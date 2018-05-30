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
