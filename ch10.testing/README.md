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
npm i eslint -g
```

使用 ESLint
前，我們必須定義一些要遵循的組態規則。我們在位於專案根目錄的組態檔案中定義，此檔案可為
JSON 或 YAML 格式。YAML 是比較讓人看得懂的資料序列格式。

ESLint 有個工具可幫助我們設定組態。有些公司製作 ESLint 組態檔案可供我們使用，或也可以自行製作。

```shell
eslint --init
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




