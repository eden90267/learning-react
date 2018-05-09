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