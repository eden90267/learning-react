# Chap 07. 強化元件

只使用 React 元件的 render 方法可以建構一些應用程式，但 JavaScript
的世界很複雜。

- 到處都有非同步
- 載入資料時要處理延遲
- 建構動畫要處理延遲

你很可能有使用 JavaScript 函式庫幫助處理 JavaScript 實務上複雜性的機會。

以第三方 JavaScript
函式庫或後台資料請求加強我們的應用程式之前，我們必須認識如何處理元件生命期；載入或更新元件時可叫用的一系列方法。

這一章從探索元件生命期開始。介紹生命期之後，我們會檢視如何以其載入資料、運用第三方
JavaScript、以及改善元件的效能。接下來我們會探索如何以高階元件跨應用程式重複運用功能。最後我們檢視另一種完全在
React 之外管理狀態的應用程式架構。

## 元件生命期

元件生命期由載入或更新元件時可叫用的一系列方法組成，這些方法在元件繪製 UI
前或後呼叫。事實上，render 方法本身是元件生命期的一部分。有兩個主要的生命期：載入生命期與更新生命期。

### 載入生命期

載入生命期由元件載入或卸下時叫用的方法組成。換句話說，這些方法讓你

- 初始化狀態
- 產生 API 呼叫
- 啟動與停止計時器
- 操作與繪製 DOM
- 初始化第三方函式庫

等。這些方法讓你利用 JavaScript 來初始化與解構元件。

載入生命期視使用 ES6 類別語法或 React.createClass 來建構元件稍有不同。

使用 createClass 時，取得元件的屬性會先叫用 getDefaultProps。接下來會叫用
getInitialState 來初始化狀態。

ES6
類別沒有這些方法。相對的，預設屬性以建構元的參數取得與設置。狀態從建構元初始化。ES6
類別的建構元與 getInitialState 均可存取屬性且在有需要時可用它們定義初始狀態。

| ES6 class              | React.createClass()    |
|:-----------------------|:-----------------------|
|                        | getDefaultProps()      |
| constructor(props)     | getInitialState()      |
| componentWillMount()   | componentWillMount()   |
| render()               | render()               |
| componentDidMount()    | componentDidMount()    |
| componentWillUnmount() | componentWillUnmount() |

> Top! 類別建構元  
> 技術上，建構元並非生命期方法。我們加上它是因為它用於元件的初始化 (狀態初始化的地方)。還有，建構元是元件載入時第一個叫用的函式。

取得屬性且狀態初始化後會呼叫 componentWillMount 方法。此方法在繪製 DOM 前叫用可用於初始化

- 第三方函式庫
- 啟動動畫
- 請求資料

等執行繪製元件前任何必要步驟。可以從這個方法呼叫 setState 以於元件首次繪製前改變元件的狀態。

讓我們使用 componentWillMount 方法初始化一些成員的請求。

