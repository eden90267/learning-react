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

讓我們使用 componentWillMount 方法初始化一些成員的請求。取得成功的回應後，我們會改變狀態。

```javascript
const getFakeMembers = count => new Promise((resolve, reject) => {
  const api = `https://api.randomuser.me/?nat=US&results=${count}`;
  const request = new XMLHttpRequest();
  request.open('GET', api);
  request.onload = () => (request.status === 200) ?
    resolve(JSON.parse(request.response).results) :
    reject(Error(request.statusText))
  request.onerror = err => reject(err);
  request.send();
});

getFakeMembers(3).then(
  members => console.log(
    members.map(m => m.name.first).join(',')
  )
);
```

我們會在 MemberList 元件的 componentWillMount 方法中使用這個 promise。此元件使用 Member 元件顯示使用者的照片、姓名、郵件地址與位置：

```javascript
const Member = ({email, picture, name, location}) =>
  <div className="member">
    <img src={picture.thumbnail}/>
    <h1>{name.first} {name.last}</h1>
    <p><a href={"mailto:" + email}>{email}</a></p>
    <p>{location.city}, {location.state}</p>
  </div>;

class MemberList extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      memebers: [],
      loading: false,
      error: null
    }
  }

  componentWillMount() {
    this.setState({loading: true});
    getFakeMembers(this.props.count).then(
      members => {
        this.setState({members, loading: false});
      },
      error => {
        this.setState({error, loading: false});
      }
    )
  }

  componentWillUpdate() {
    console.log('updating lifecycle');
  }

  render() {
    const {members, loading, error} = this.state;
    return (
      <div className="member-list">
        {(loading) ?
          <span>Loading Member</span> :
          (members.length) ?
            members.map((user, i) =>
              <Member key={i} {...user}/>
            ) :
            <span>0 members loaded...</span>
        }
        {(error) ? <p>Error Loading Members: error</p> : ""}
      </div>
    );
  }

}
```

> Top! 在 componentWillMount 中使用 setState  
> 在元件繪製前呼叫 setState 不會啟動更新生命期，元件繪製後呼叫 setState 會啟動更新生命期。若在 componentWillMount 方法中定義的非同步 callback 中呼叫 setState，它會在元件繪製後叫用並觸發更新生命期。

元件的載入生命期的其他方法包括 componentDidMount 與 componentWillUnmount。componentDidMount 在元件繪製後立即叫用，而 componentWillUnmount 在卸下元件前立即叫用。

componentDidMount 是另一個放 API 請求的好地方。此方法在元件繪製後叫用，因此此方法的任何 setState 呼叫會啟動更新生命期並繪製元件。

componentDidMount 也是初始化需要 DOM 的第三方 JavaScript 的好地方。舉例來說，你可能想要使用支援拖放功能的函式庫或處理觸控事件的函式庫，通常這些函式庫在初始化前需要 DOM。

另一個 componentDidMount 的用途是啟動定時或計時器等背景行程。在 componentDidMount 或 componentWillMount 啟動的行程可在 componentWillUnmount 中清理。背景行程不在需要時你不會想留著它們。

元件在父元件刪除它們時卸下或被 react-dom 中的 unmountComponentAtNode 函式卸下。此方法用於卸下根元件。卸下根元件時，它的子元件會先被卸下。

讓我們看看一個時鐘範例。載入 Clock 元件時會啟動一個計時器。使用者點擊關閉按鈕時，時鐘會以 unmountComponentAtNode 卸下並停止計時器。

```javascript
import {Component} from 'react';
import {getClockTime} from "../lib";

export default class Clock extends Component {

  constructor() {
    super(...arguments);
    this.state = getClockTime()
  }

  componentDidMount() {
    console.log('Starting Clock');
    this.ticking = setInterval(() =>
        this.setState(getClockTime())
      , 1000);
  }

  componentWillUnmount() {
    clearInterval(this.ticking);
    console.log('Stopping Clock');
  }

  render() {
    const {hours, minutes, seconds, timeOfDay} = this.state;
    return (
      <div className="clock">
        <span>{hours}</span>
        <span>:</span>
        <span>{minutes}</span>
        <span>:</span>
        <span>{seconds}</span>
        <span>{timeOfDay}</span>
        <button onClick={this.props.onClose}>X</button>
      </div>
    )
  }

}
```

### 更新生命期

更新生命期是元件的狀態改變或從父元件接收新屬性時會叫用的一系列方法。此生命期可在元件更新前或與 DOM 互動更新後執行 JavaScript。此外，它還可用於改善應用程式的效能，因為它能讓你取消不必要的更新。

更新生命期在 setState 被呼叫時啟動。在更新生命期中呼叫 setState 會導致無限遞迴而產生堆疊溢流錯誤。因此 setState 只能在 componentWillReceiveProps 中呼叫，它讓元件在屬性被更新時更新狀態。

更新生命期的方法有：

- **componentWillReceiveProps(nextProps)**

  只在新屬性傳給元件時被叫用。這是唯一能呼叫 setState 的方法

- **shouldComponentUpdate(nextProps, nextState)**

  更新生命期的門衛 —— 可取消更新的述詞。此方法可透過管制必要的更新來改善效能

- **componentWillUpdate(nextProps, nextState)**

  於元件更新前呼叫。類似 componentWillMount，但只在每個更新發生前呼叫

- **componentDidUpdate(prevProps, prevState)**

  更新發生後叫用，在 render 的呼叫之後。類似 componentDidMount，但在每個更新後叫用

讓我們修改前一張的顏色管理應用程式，對 Color 元件加上一些更新生命期函式以觀察更新生命期的運作。假設狀態陣列已經有四個顏色。首先，我們會使用 componentWillMount 方法初始化顏色物件與樣式，並設定四個 Color 元素的背景為灰色。

```javascript
export default class Color extends Component {

  componentWillMount() {
    this.style = {backgroundColor: '#CCC'};
  }

  render() {
    const {title, rating, color, onRate} = this.props;
    return (
      <section className="color" style={this.style}>
        <h1 ref="title">{title}</h1>
        <div className="color"
             style={{backgroundColor: color}}>
        </div>
        <div>
          <StarRating starsSelected={rating}
                      onRate={onRate}/>
        </div>
      </section>
    )
  }
}

Color.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  rating: PropTypes.number,
  onRemove: PropTypes.func,
  onRate: PropTypes.func
};

Color.defaultProps = {
  title: undefined,
  rating: 0,
  color: '#000000',
  onRate: f => f
};
```

我們可以對 Color 元件加上 componentWillUpdate 以於顏色更新時刪除灰色背景：

```javascript
componentWillMount() {
  this.style = {backgroundColor: '#CCC'};
}

componentWillUpdate() {
  this.style = null;
}
```

執行此程式並對任一顏色評分，你會發現雖然只有評分一個顏色但四個顏色都有更新。

因為父元件 ColorList 更新狀態而重新繪製每個 Color 元件。元件是重新繪製而非重新載入；若已經載入就會更新。元件被更新時，所有子元件也會更新。對一個顏色評分，所有元件都更新，四個 StarRating 元件被更新，且每個元件的五顆星也更新。

我們可以透過阻止屬性值沒有改變的顏色更新以改善應用程式的效能。加上生命期函式 shouldComponentUpdate 以防止不必要的更新。此方法回傳 true or false (應該更新 true，略過更新 false)：

```javascript
componentWillMount() {
  this.style = {backgroundColor: '#CCC'};
}

shouldComponentUpdate(nextProps) {
  const {rating} = this.props;
  return rating !== nextProps.rating;
}

componentWillUpdate() {
  this.style = null;
}
```

若 shouldComponentUpdate 方法回傳 true，其餘的更新生命期會發生。其餘的生命期函式也會收到新屬性與新狀態 (componentDidUpdate 方法會收到前一個屬性與狀態，因為此方法執行時更新已經發生且屬性已經改變)。

讓我們紀錄元件更新訊息：

```javascript
componentWillMount() {
  this.style = {backgroundColor: '#CCC'};
}

shouldComponentUpdate(nextProps) {
  const {rating} = this.props;
  return rating !== nextProps.rating;
}

componentWillUpdate() {
  this.style = null;
}

componentDidUpdate(prevProps) {
  const {title, rating} = this.props;
  const status = (rating > prevProps.rating) ? 'better' : 'worse';
  console.log(`${title} is getting ${status}`);
}
```

更新生命期方法 componentWillUpdate 與 componentDidUpdate 是更新前後與 DOM 元素互動的好地方。下一個範例的更新查詢會以 componentWillUpdate 中的警告對話框暫停：

```javascript
componentWillMount() {
  this.style = {backgroundColor: '#CCC'};
}

shouldComponentUpdate(nextProps) {
  const {rating} = this.props;
  return rating !== nextProps.rating;
}

componentWillUpdate(nextProps) {
  const {title, rating} = this.props;
  this.style = null;
  console.log(this.refs.title);
  this.refs.title.style.backgroundColor = "red";
  this.refs.title.style.color = "white";
  alert(`${title}: rating ${rating} -> ${nextProps.rating}`);
}

componentDidUpdate(prevProps) {
  const {title, rating} = this.props;
  const status = (rating > prevProps.rating) ? 'better' : 'worse';
  this.refs.title.style.backgroundColor = "";
  this.refs.title.style.color = "black";
}
```

若將評分改變，更新程序會被警告對話框暫停。顏色名稱的 DOM 元素有不同背景與文字顏色。

清除對話框後元件立即更新，並呼叫 componentDidUpdate 清除名稱的背景顏色。

有時候元件的初始狀態由屬性設定。我們可以在建構元或 componentWillMount 生命期方法中設定元件類別的初始狀態。這些屬性變更時，我們需要使用 componentWillReceiveProps 方法更新狀態。

以下範例，狀態由父元件 HiddenMessages 保存。此元件在狀態中保存三則訊息，每次只顯示一則訊息。載入 HiddenMessages 時會加入一個定時間隔輪流顯示一則訊息。

```javascript
class HiddenMessages extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      messages: [
        "The crow corws after midnight",
        "Bring a watch and dark clothes to the spot",
        "Jericho Jericho Go"
      ],
      showing: -1
    };
  }

  componentWillMount() {
    this.interval = setInterval(() => {
      let {showing, messages} = this.state;
      showing = (++showing >= messages.length) ?
        -1 :
        showing;
      console.log('showing: ' + showing);
      this.setState({showing});
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {messages, showing} = this.state;
    return (
      <div className="hidden-messages">
        {messages.map((message, i) =>
          <HiddenMessage key={i}
                         hide={(i !== showing)}>
            {message}
          </HiddenMessage>
        )}
      </div>
    )
  }

}
```

```javascript
class HiddenMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: (props.hide) ? props.hide : true
    };
  }
  render() {
    const {children} = this.props;
    const {hidden} = this.state;
    return (
      <p>
        {(hidden) ?
          children.replace(/[a-zA-Z0-9]/g, "x") :
          children
        }
      </p>
    )
  }
}
```

HiddenMessage 元件，hide 屬性用於判斷它的狀態。但父元件更新此元件的屬性時不會發生什麼事，此元件不會知道屬性被更新。

問題發生於父元件改變 hide 屬性時，這個改變不會自動的引發 HiddenMessage 的狀態的變更。

componentWillReceiveProps 生命期方法用於處理這種狀況。它會在屬性被父元件改變時被呼叫，被改變的屬性可用於內部的狀態修改：

```javascript
class HiddenMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: (props.hide) ? props.hide : true
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({hidden: nextProps.hide});
  }
  render() {
    const {children} = this.props;
    const {hidden} = this.state;
    return (
      <p>
        {(hidden) ?
          children.replace(/[a-zA-Z0-9]/g, "x") :
          children
        }
      </p>
    )
  }
}
```

父元件 HiddenMessages 改變 hide 屬性時，componentWillReceiveProps 可讓我們更新狀態。

#### 從屬性設定狀態

上面程式碼範例經過縮小以示範 componentWillReceiveProps 的運用。若只這樣使用 HiddenMessage，則應改用無狀態函式性元件。對子元件加上狀態的唯一原因是我們想要元件在內部做出改變。

舉例來說，若元件需要一個 setState 呼叫，則使用 componentWillReceiveProps 修改狀態是有必要的：

```javascript
hide() {
  const hidden = true;
  this.setState({hidden});
}

show() {
  const hidden = false;
  this.setState({hidden});
}

render() {
  const {children} = this.props;
  const {hidden} = this.state;
  return (
    <p onMouseEnter={this.show}
       onMouseLeave={this.hide}>
      {(hidden) ?
        children.replace(/[a-zA-Z0-9]/g, "x") :
        children
      }
    </p>
  )
}
```

此例中，將狀態儲存在 HiddenMessage 元件中是合適的。若元件不打算改變本身，則應該保持無狀態並只從父元件管理狀態。

元件生命期方法使我們對元件如何繪製或更新有更多的控制，它們提供載入與更新前後加上功能的接點。接下來討論生命期方法如何與第三方 JavaScript 函式庫並用，但先簡短看一下 “React.Children” 這個 API。

## React.Children

React.Children 提供操作特定元件的子元件之方式。它能讓你計算、對應、迭代，或將
props.children 轉換成陣列。它也能讓你以 React.Children.only
檢驗只顯示單一的子元件：

```javascript
import {Children} from 'react';
import {render} from 'react-dom';

const Display = ({ifTruthy = true, children}) =>
  (ifTruthy) ?
    Children.only(children) :
    null;

const age = 22

render(
  <Display ifTruthy={age >= 21}>
    <h1>You can enter</h1>
  </Display>,
  document.getElementById('react-container')
);
```

若 Display 元件有多個子元件，React 會拋出一個錯誤：“onlyChild must be passed
a children with exactly one child”

我們也可使用 React.Children 將 children 元素轉換到陣列中。下一個範例擴充
Display 元件以處理其他狀況：

```javascript
const {Component, Children, PropTypes, createClass} = React;
const {render} = ReactDOM;

const findChild = (children, child) =>
  Children.toArray(children)
    .filter(c => c.type === child)[0];

const WhenTruthy = ({children}) =>
  Children.only(children);

const WhenFalsy = ({children}) =>
  Children.only(children);

const Display = ({ifTruthy = true, children}) =>
  (ifTruthy) ?
    findChild(children, WhenTruthy) :
    findChild(children, WhenFalsy);

const age = 19

render(
  <Display ifTruthy={age >= 21}>
    <WhenTruthy>
      <h1>You can Enter</h1>
    </WhenTruthy>
    <WhenFalsy>
      <h1>Bast it Kid</h1>
    </WhenFalsy>
  </Display>,
  document.getElementById('react-container')
);
```

Display 元件會依條件為 true 或 false 顯示其中一個子元件。我們建構了 WhenTruthy
與 whenFalsy 元件並將它們作為 Display 元件的子元件。findChild 函式使用了
React.Children 將子元件轉換到陣列中。我們可過濾陣列以依元件型別找出並回傳個別子元件。

## JavaScript 函式庫整合

Angular 與 jQuery 等框架有自己的資料存取、繪製
UI、狀態模型、路由處理等工具。React 只是建構 view 的函式庫，因此我們需要並用其他
JavaScript 函式庫。若我們知道生命期函式如何運作，可以讓 React 與任何 JavaScript 函式庫合作。

> Top! React 與 jQuery  
> 並用 jQuery 與 React 對社群來說通常是個麻煩。jQuery 與 React
> 可以整合，且整合會是學習 React 或改寫舊程式碼的好選擇，但與 React
> 並用較小的函式庫而非大框架時應用程式的效能比較好。此外，使用 jQuery 略過虛擬
> DOM 直接操作 DOM 會引發奇怪的錯誤。

這一節會並用 React 元件與幾個不同的 JavaScript 函式庫，特別是呼叫 API 並以其他
JavaScript 函式庫將資料視覺化。

### 以 Fetch 發出請求

Fetch 是 WHATWG 集團開發的自動補完函式庫 (Polyfill)，可讓我們使用 promise 發出
API 呼叫。這一節介紹 isomorphic-fetch，它是能與 React 合作良好的 Fetch 版本。

```shell
npm i isomorphic-fetch --save
```

元件生命期函式提供整合 JavaScript 的地方。此例中，我們在該處發出 API 呼叫。發出
API 呼叫的元件必須處理使用者等待回應時遇到的延遲。我們可在狀態中引用變數告訴元件請求是否等待中來處理這些問題。

下面的範例，CountryList 元件建構一個有排序國家名稱清單。載入後，元件會發出 API
呼叫並改變狀態以反映資料已載入。載入中的狀態會維持 true 直到 API 呼叫有了回應：

```javascript
class CountryList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      countryNames: [],
      loading: false
    }
  }

  componentDidMount() {
    this.setState({loading: true});
    fetch('https://restcountries.eu/rest/v1/all')
      .then(response => response.json())
      .then(json => json.map(country => country.name))
      .then(countryNames =>
        this.setState({countryNames, loading: false})
      );
  }

  render() {
    const {countryNames, loading} = this.state;
    return (loading) ?
      <div>Loading Country Names...</div> :
      (!countryNames.length) ?
        <div>No country Names</div> :
        <ul>
          {countryNames.map(
            (x, i) => <li key={i}>{x}</li>
          )}
        </ul>;
  }

}

render(
  <CountryList/>,
  document.getElementById('react-container')
);
```

### 並用 D3 時間軸

Data Driven Documents (D3) 是個建構瀏覽器資料視覺化的 JavaScript 框架，D3 提供一組工具讓我們計算刻度與內插資料。此外，D3 是函式性的，可鏈接函式呼叫以從資料陣列產生 DOM 視覺化來製作 D3 應用程式。

時間軸是個資料視覺化的範例。時間軸以事件日期作為資料並以圖型視覺化的展示資訊，之前發生的歷史事件在之後發生的歷史事件的左邊。時間軸上事件間的空白元素代表事件間的時間間隔。

此時間軸將 100 年左右事件以 500 個像素寬進行視覺化。將年值轉換成相對應的像素值稱為內插 (interpolation)，D3 提供內插資料所需的所有工具。

讓我們來看一下如何並用 D3 與 React 來建構時間軸。

```shell
npm i d3 --save
```

D3 通常取用物件陣列並根據資料製作視覺化。以下是 滑雪日期歷史 的時間軸資料：

```javascript
const historicDatesForSkiing = [
  {
      year: 1879,
      event: "Ski Manufacturing Begins"
  },
  {
      year: 1882,
      event: "US Ski Club Founded"
  },
  {
      year: 1924,
      event: "First Winter Olympics Held"
  },
  {
      year: 1926,
      event: "First US Ski Shop Opens"
  },
  {
      year: 1932,
      event: "North Americas First Rope Tow Spins"
  },
  {
      year: 1936,
      event: "First Chairlift Spins"
  },
  {
      year: 1949,
      event: "Squaw Valley, Mad River Glen Open"
  },
  {
      year: 1958,
      event: "First Gondola Spins"
  },
  {
      year: 1964,
      event: "Plastic Buckle Boots Available"
  }
]
```

並用 D3 與 React 元件最簡單的方式是讓 React 繪製 UI，然後用 D3 建構視覺化。在下面範例中，D3 整合進 React 元件。繪製元件後，D3 建構出視覺化並將其加到 DOM 中。

```javascript
class Timeline extends Component {

  constructor({data = []}) {
    super({data});
    const times = d3.extent(data.map(d => d.year));
    const range = [50, 450];
    this.state = {data, times, range};
  }

  componentDidMount() {
    let group;
    const {data, times, range} = this.state;
    const {target} = this.refs;
    const scale = d3.time.scale().domain(times).range(range);

    d3.select(target)
      .append('svg')
      .attr('height', 200)
      .attr('width', 500);

    group = d3.select(target.children[0])
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr(
        'transform',
        (d, i) => 'translate(' + scale(d.year) + ',0)'
      );

    group.append('circle')
      .attr('cy', 160)
      .attr('r', 5)
      .attr('fill', 'blue');

    group.append('text')
      .text(d => d.year + ' - ' + d.event)
      .style('font-size', 10)
      .attr('y', 115)
      .attr('x', -95)
      .attr('transform', 'rotate(-45)');
  }

  render() {
    return (
      <div className="timeline">
        <h1>{this.props.name} Timeline</h1>
        <div ref="target"></div>
      </div>
    )
  }

}
```

此例中，有些 D3 的設定發生在建構元中，但大部分工作由 componentDidMount 函式中的 D3 完成。DOM 繪製後，D3 使用 Scalable Vector Graphics (SVG) 建構視覺化。這種方式可行且是將 D3 視覺化加入 React 元件的好方法。

但我們可以對此進一步的整合以讓 React 管理 DOM 而 D3 執行運算。看一下這三行程式：

```javascript
const times = d3.extent(data.map(d => d.year));
const range = [50, 450];
    
const scale = d3.time.scale().domain(times).range(range);
```

times 與 range 都在建構元中設定並加入元件的狀態中。

- times 代表我們的值域，它帶有之前與最新年份的資料。它由 D3 的 extent 函式計算以找出數值陣列中的最大與最小值。
- range 代表時間軸中像素的範圍，第一個日期 1879 放在 x 軸的 0px 處，而最後一個日期 1964 放在 x 軸的 450px 處。
- scale 代表建構刻度，它是用於對時間刻度內插像素值的函式。此刻度透過傳送值域與範圍給 D3 的 time.scale 函式建構。scale 函式用於視覺化以取得 1879 與 1964 間每個日期的 x 位置。

相較於在 componentDidMount 建構刻度，我們可在取得值域與範圍後從建構元將它加到元件中。現在刻度可以在元件中使用 this.scale(year) 存取：

```javascript
constructor({data = []}) {
  super({data});
  const times = d3.extent(data.map(d => d.year));
  const range = [50, 450];
  this.scale = d3.time.scale().domain(times).range(range);
  this.state = {data, times, range};
}
```

在 componentDidMount 中，D3 先建構一個 SVG 元素加入到目標的參考中。

```javascript
d3.select(target)
  .append('svg')
  .attr('height', 200)
  .attr('width', 500);
```

建構 UI 是 React 的工作。相較於使用 D3 進行，讓我們建構一個回傳 SVG 元素的 Canvas 元件：

```javascript
const Canvas = ({children}) =>
  <svg height="200" width="500">
    {children}
  </svg>;
```

接下來，D3 選取 svg 元素，目標下的第一個子元素，並對時間軸陣列中每個資料點加上一個 group 元素，然後 group 元素使用 scale 函式轉換成 x 軸的值位置：

```javascript
group = d3.select(target.children[0])
  .selectAll('g')
  .data(data)
  .enter()
  .append('g')
  .attr(
    'transform',
    (d, i) => 'translate(' + scale(d.year) + ',0)'
  );
```

group 元素是一個 DOM 元素，因此我們也可以讓 React 處理這個工作。下面是 TimelineDot 元件，可用於設定 group 元素並沿著 x 軸定位：

```javascript
const TimelineDot = ({position}) =>
  <g transform={`translate(${position}, 0)`}></g>;
```

接下來，D3 對 group 加上 circle 元素與一些 “樣式”。text 元素以連接事件年份與事件標題作為值，然後定位並依藍色圓圈旋轉文字：

```javascript
group.append('circle')
  .attr('cy', 160)
  .attr('r', 5)
  .attr('fill', 'blue');

group.append('text')
  .text(d => d.year + ' - ' + d.event)
  .style('font-size', 10)
  .attr('y', 115)
  .attr('x', -95)
  .attr('transform', 'rotate(-45)');
```

我們要做的只是修改 TimelineDot 元件以包括 circle 元素與從屬性擷取文字的 text 元素：

```javascript
const TimelineDot = ({position, txt}) =>
  <g transform={`translate(${position}, 0)`}>
    <circle cy={160}
            r={5}
            style={{fill: 'blue'}}></circle>
    <text y={115}
          x={-95}
          transform="rotate(-45)"
          style={{fontSize: '10px'}}>{txt}</text>
  </g>;
```

現在 React 負責使用虛擬 DOM 管理 UI。D3 的角色被縮小，但還是提供一些 React 沒有的基本功能。它幫助建構值域與範圍並構建依年份內插像素值的 scale 函式。下面是重構後的 Timeline 元件：

```javascript
class Timeline extends Component {

  constructor({data = []}) {
    super({data});
    const times = d3.extent(data.map(d => d.year));
    const range = [50, 450];
    this.scale = d3.time.scale().domain(times).range(range);
    this.state = {data, times, range};
  }

  render() {
    const {data} = this.state;
    const {scale} = this;
    return (
      <div className="timeline">
        <h1>{this.props.name} Timeline</h1>
        <Canvas>
          {data.map((d, i) =>
            <TimelineDot key={i}
                         position={scale(d.year)}
                         txt={`${d.year} - ${d.event}`}/>
          )}
        </Canvas>
      </div>
    )
  }

}
```

我們可以整合 React 與任何 JavaScript。生命期函式是 JavaScript 能夠執行 React 所缺乏的的功能的地方，但我們應該避免加入管理 UI 的函式庫：那是 React 的工作。

## 高階元件

高階元件 (higher-order component，HOC) 是以 React 元件作為參數並回傳另一個 React 元件的函式。HOC 通常將輸入的元件以維護狀態或具有功能的類別包裝。高階元件是跨 React 元件重複使用功能的最佳方式。

### 不支援 mixin

直到 v0.13，在 React 元件中引入功能的最好方式是使用 mixin。mixin 可直接加入以 createClass 建構的元件作為組態屬性。React.createClass 還是可以使用 mixin，但 ES6 類別或無狀態函式性元件並不支援。未來 React 版本也不會支援。

HOC 可讓我們將元件包裝在另一個元件中。父元件可保存能夠以屬性向下傳遞的狀態或功能。組合元件除了屬性與方法名稱外並不需要知道 HOC 如何實作。

檢視下列 PeopleList 元件。它從 API 載入假使用者資料並繪製姓名清單，載入使用者時會顯示載入中的訊息。載入後會顯示在 DOM 上面：

```javascript
class PeopleList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      loading: false
    };
  }

  componentWillMount() {
    this.setState({loading: true});
    fetch('https://randomuser.me/api/?results=10')
      .then(response => response.json())
      .then(obj => obj.results)
      .then(data => this.setState({
        loaded: true,
        loading: false,
        data
      }));
  }

  render() {
    const {data, loading, loaded} = this.state;
    return (loading) ?
      <div>Loading</div> :
      <ol className="people-list">
        {data.map((person, i) => {
          const {first, last} = person.name;
          return <li key={i}>{first} {last}</li>
        })}
      </ol>;
  }

}


render(
  <PeopleList/>,
  document.getElementById('react-container')
);
```

若以此載入功能，它可以跨元件重複使用。我們建構高階元件 DataComponent 來建構載入資料的 React 元件。

```javascript
const PeopleList = ({data}) =>
  <ol className="people-list">
    {data.map((person, i) => {
      const {first, last} = person.name;
      return <li key={i}>{first} {last}</li>
    })}
  </ol>;

const RandomMeUsers = DataComponent(
  PeopleList,
  "https://randomuser.me/api?results=10"
);


render(
  <RandomMeUsers/>,
  document.getElementById('react-container')
);
```

資料的處理移至 HOC，而 UI 由 PeopleList 元件處理。HOC 提供載入狀態與載入機制並改變它自己的狀態。載入資料時，HOC 會顯示載入中訊息。資料載入後，HOC 會處理 PeopleList 的載入並以 data 屬性船入資料：

```javascript
const DataComponent = (ComposedComponent, url) =>
  class DataComponent extends Component {
    constructor() {
      super(...arguments);
      this.state = {
        data: [],
        loading: false,
        loaded: false
      };
    }

    componentWillMount() {
      this.setState({loading: true});
      fetch(url)
        .then(response => response.json())
        .then(data => this.setState({
          loaded: true,
          loading: false,
          data
        }));
    }

    render() {
      return (
        <div className="data-component">
          {(this.state.loading) ?
            <div>Loading...</div> :
            <ComposedComponent {...this.state}/>
          }
        </div>
      )
    }
  };
```

請注意 DataComponent 實際上是個函式。所有高階元件都是函式。ComposedComponent 是我們包裝的元件，其回傳的 DataComponent 類別儲存與管理狀態。狀態改變且資料載入時，ComposedComponent 被繪製且資料以屬性傳入。

HOC 可用於建構任何型別的資料元件。讓我們看一下 DataComponent 如何重複使用以建構從 restcountries.eu 的 API 產生世界各國名稱的 CountryDropDown：

```javascript
const DataComponent = (ComposedComponent, url) =>
  class DataComponent extends Component {
    constructor() {
      super(...arguments);
      this.state = {
        data: [],
        loading: false,
        loaded: false
      };
    }

    componentWillMount() {
      this.setState({loading: true});
      fetch(url)
        .then(response => response.json())
        .then(data => this.setState({
          loaded: true,
          loading: false,
          data
        }));
    }

    render() {
      return (
        <div className="data-component">
          {(this.state.loading) ?
            <div>Loading...</div> :
            <ComposedComponent {...this.state}
                               {...this.props}/>
          }
        </div>
      )
    }
  };

const CountryNames = ({data, selected = ""}) =>
  <select className="people-list" defaultValue={selected}>
    {data.map(({name}, i) =>
      <option key={i} value={name}>{name}</option>
    )}
  </select>;

const CountryDropDown =
  DataComponent(
    CountryNames,
    'https://restcountries.eu/rest/v1/all'
  );

render(
  <CountryDropDown selected="United States"/>,
  document.getElementById('react-container')
);
```

讓我們看看另一個 HOC。之前開發過的 HiddenMessage
元件，其顯示與隱藏功能可重複使用。以下範例有個稱 Expandable 的 HOC，功能類似
HiddenMessage 元件，你可工具 collapsed 屬性顯示或隱藏內容。此 HOC 還提供切換
collapsed 屬性的機制。

```javascript
const Expandable = ComposedComponent =>
  class Expandable extends Component {
    constructor(props) {
      super(props);
      const collapsed =
        (props.hidden && props.hidden === true) ?
          true :
          false;
      this.state = {collapsed};
      this.expandCollapse = this.expandCollapse.bind(this);
    }

    expandCollapse() {
      let collapsed = !this.state.collapsed;
      this.setState({collapsed});
    }

    render() {
      return <ComposedComponent expandCollapse={this.expandCollapse}
                                {...this.state}
                                {...this.props} />
    }
  };
```

Expandable 接收 ComposedComponent
並包裝顯示或隱藏的狀態與功能。收起的狀態為初始化屬性或預設值
false。收起狀態以屬性傳給 ComposedComponent。

現在來建構 HiddenMessage 元件

```javascript
const ShowHideMessage = ({children, collapsed, expandCollapse}) =>
  <p onClick={expandCollapse}>
    {(collapsed) ?
      children.replace(/[a-zA-Z0-9]/g, "x") :
      children
    }
  </p>;

const HiddenMessage = Expandable(ShowHideMessage);

render(
  <HiddenMessage hidden={true}>This is a hidden message</HiddenMessage>,
  document.getElementById('react-container')
);
```

讓我們以同一個 HOC 建構顯示與隱藏 div 中內容的按鈕。

```javascript
class MenuButton extends Component {

  componentWillReceiveProps(nextProps) {
    const collapsed = nextProps.collapsed && nextProps.collapsed === true ?
      true :
      false;
    this.setState({collapsed});
  }

  render() {
    const {children, collapsed, txt, expandCollapse} = this.props;
    return (
      <div className="pop-button">
        <button onClick={expandCollapse}>{txt}</button>
        {(!collapsed) ?
          <div className="pop-su">
            {children}
          </div> :
          ""
        }
      </div>
    );
  }
}

const PopUpButton = Expandable(MenuButton);

render(
  <PopUpButton hidden={true} txt="toggle popup">
    <h1>Hidden Content</h1>
    <p>This content will start off hidden</p>
  </PopUpButton>,
  document.getElementById('react-container')
);
```

**高階元件是重複使用功能與將元件狀態或生命期如何管理的細節抽離的好方式**，它們能讓你產生更多只負責 UI 的無狀態函式性元件。

## 從 React 外管理狀態

React 狀態管理很棒。我們可以使用 React
內建的狀態管理系統建構很多應用程式，但應用程式變大時，狀態會變得有點麻煩。在元件樹的根集中保存狀態會比較好處理，但就算這樣，你的應用程式還是會大到需要獨立於
UI 的狀態資料層。

從 React
外管理狀態的好處之一是它會減少類別元件的需求。若不使用狀態，讓元件無狀態比較好。你應該只在有需要生命期函式建構類別，此時可以將類別功能放在
HOC 並讓元件無狀態的只負責
UI。無狀態函式性元件比較容易理解與測試，它們是純函式，因此適用於嚴格的函式性應用程式。

從 React 外管理狀態有很多不同的意思。你可以並用 React 與 Backbone Model 或其他
MVC 函式庫；你可以自行建構管理狀態的系統；你可以使用全域變數或 localStorage 與
JavaScript 管理狀態。從 React 外管理狀態只是表示不使用 React 的狀態或 setState。

### 繪製時鐘

我們在第三章建構了一個時鐘。整個應用程式由函式與高階函式組成 startTicking 函式來啟動時鐘並在控制台顯示時間。

```javascript
const oneSecond = () => 1000
const getCurrentTime = () => new Date()
const clear = () => console.clear()
const log = message => console.log(message)
const abstractClockTime = date =>
  ({
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  })
const civilianHours = clockTime =>
  ({
    ...clockTime,
    hours: (clockTime.hours > 12) ? clockTime.hours - 12 : clockTime.hours
  })
const appendAMPM = clockTime =>
  ({
    ...clockTime,
    ampm: (clockTime.hours >= 12) ? "PM" : "AM"
  })
const display = target => time => target(time)
const formatClock = format =>
  time =>
    format.replace("hh", time.hours)
      .replace("mm", time.minutes)
      .replace("ss", time.seconds)
      .replace("tt", time.ampm)
const compose = (...fns) =>
  (arg) =>
    fns.reduce(
      (composed, f) => f(composed),
      arg
    )
const convertToCivilianTime = clockTime =>
  compose(
    appendAMPM,
    civilianHours
  )(clockTime)
const prependZero = key => clockTime =>
  ({
    ...clockTime,
    [key]: (clockTime[key] < 10) ? "0" + clockTime[key] : clockTime[key]
  })
const doubleDigits = civilianTime =>
  compose(
    prependZero("hours"),
    prependZero("minutes")
  )(civilianTime)


const startTicking = () =>
  setInterval(
    compose(
      clear,
      getCurrentTime,
      abstractClockTime,
      convertToCivilianTime,
      doubleDigits,
      display(log)
    ),
    oneSecond()
  )

startTicking();
```

若要在瀏覽器顯示呢？

```javascript
const AlarmClockDisplay = ({hours, minutes, seconds, ampm}) =>
  <div className="clock">
    <span>{hour}</span>
    <span>:</span>
    <span>{minutes}</span>
    <span>:</span>
    <span>{seconds}</span>
    <span>{ampm}</span>
  </div>;
```

我們可改用 render 方法與以元件繪製時間，並對小於 10 的值前面補零。render 必須是高階函式。

```javascript
const render = Component => civilianTime =>
  ReactDOM.render(
    <Component {...civilianTime}/>,
    document.getElementById('react-container')
  );

const startTicking = () =>
  setInterval(
    compose(
      getCurrentTime,
      abstractClockTime,
      convertToCivilianTime,
      doubleDigits,
      render(AlarmClockDisplay)
    ),
    oneSecond()
  );

startTicking();
```

此應用程式的狀態在 React 外管理。React 透過 ReactDOM.render
繪製元件的自定高階函式讓我們保持函式性架構。從 React
外管理狀態不是必要而只是個選項。React 是個函式庫，由你決定如何在應用程式中運用最好。

接下來介紹 Flux，它是 React 狀態管理的替代方案之設計模式。

## Flux

Flux 是 Facebook 開發的設計模式，要來保持單向的資料流。Flux
出現前，網頁開發架構是由各種 MVC 設計模式支配。Flux 是 MVC 的替代方案，有完全不同的函式性設計模式。

React 或 Flux 對函式性 JavaScript
有什麼意義？簡單地說，無狀態函式性元件是純函式、它以指令作為屬性並回傳 UI
元素。以狀態或屬性作為輸入的 React 類別也會產生 UI 元素。React
元件被組成單一元件。輸入不可變資料給元件並回傳 UI 元素作為輸出。

```javascript
const Countdown = ({count}) => <h1>{count}</h1>;
```

Flux 提供一種**補充** React 的網頁應用程式架構，特別是它提供一種供給 React 用於建構
UI 的資料的方式。

在 Flux 中，應用程式的狀態是由 React 元件外的 store 管理。store
保存與改變資料，是唯一能更新 Flux 的 view 的東西。若使用者與網頁互動 ——
例如點擊按鈕或提交表單 —— 則會產生一個 action 來表示使用者的請求。action
提供進行改變的指令與資料，它由稱為 dispatcher 的中央管理元件分發。dispatcher
會收集 action 並分發給適當的 store。store 接收到 action，它會用 action
作為指令來修改狀態並更新 view。資料流只有一個方向：action 到 dispatcher 到
store 最終到 view。

![](https://imgur.com/CSrn5pq.png)

Flux 中的 action 與狀態資料是不可變的。action 可從 view 或網頁伺服器等來源發出。

每個異動需要一個 action。每個 action 提供進行異動的指令。action
還可作為紀錄告訴我們改變什麼、用什麼資料作出改變與 action
的來源。這種模式不會有副作用。唯一能做改變的是 store。store 更新資料、view 在 UI
中繪製更新，而 action 告訴我們資料如何與為何發生異動。

以此設計模式限制應用程式的資料流能讓你的應用程式更容易修改與擴充。

讓我們以一個倒數的應用程式作為範例開始如何使用 Flex 設計模式：

### view

從 view 這個 React 無狀態元件開始。Flux
會管理應用程式的狀態，因此除非需要生命期函式，否則不需要類別元件。

倒數的 view 以屬性取得要顯示的計數。它還接收 tick 與 reset 兩個函式：

```javascript
const Countdown = ({count, tick, reset}) => {
  if (count) {
    setTimeout(() => tick(), 1000);
  }
  return (count) ?
    <h1>{count}</h1> :
    <div onClick={() => reset(10)}>
      <span>CELEBRATE!!!</span>
      <span>(click to start over)</span>
    </div>
};
```

繪製此 view 時會顯示計數，除非為 0 會顯示 "CELEBRATE!!!"
訊息給使用者。若計數不是 0，則 view 設定逾時，等待一秒，然後呼叫 TICK。

計數為 0，此 view 不會呼叫其他 action 建構者直到使用者直到使用者點擊主 div
並觸發重置。此重置將計數設為 10 並重新啟動倒數程序。

> Top! 元件中的狀態  
> 使用 Flux 不代表不能在 view 元件中有狀態，它表示應用程式的狀態不在 view
> 元件中管理。舉例來說，Flux
> 可管理時間軸的日期與時間，使用具有內部狀態來視覺化應用程式的時間軸之時間軸元件沒有問題。

> 狀態應該少用 ——
> 只有在必要時用於自行管理內部狀態的可重複使用元件。應用程式的其他部分不需要 “知道“
> 子元件的狀態。

### action 與 action creator

action 提供 store 用於修改狀態的指令與資料。action **構建者**是用於將建構
action 的細節抽象化的函式。action 本身是至少帶有 type 欄位的物件。action
的型別通常是描述 action 的大寫字串。此外，action 可包含 store 所需的資料。例如：

```javascript
const countdownActions = dispatcher =>
  ({
    tick(currentCount) {
      dispatcher.handleAction({type: 'TICK'})
    },
    reset(count) {
      dispatcher.handleAction({
        type: 'RESET',
        count
      })
    }
  });
```

載入倒數的 action 建構者時，dispatcher 以參數傳入。每次呼叫 TICK 或 RESET
時會呼叫 dispatcher 的 handleAction 來 “分發” action 物件。

### dispatcher

dispatcher 只有一個，它代表此設計模式的交通管制部分。dispatcher 接收
action，將其加上 action 來源的資訊後傳送給合適的 store 或處理該 action 的 store。

雖然 Flux 不是框架，但 Facebook 有開放一個 Dispatcher
類別原始碼可使用。dispatcher 通常依標準實作，因此最好是使用 Facebook
的而不要自行設計。

```javascript
class CountdownDispatcher extends Dispatcher {

  handleAction(action) {
    console.log('dispatching action:', action);
    this.dispatch({
      source: 'VIEW_ACTION',
      action
    });
  }

}
```

handleAction 被呼叫時，它會帶有 action 來源的資料。建構 store 時會向
dispatcher 登記並開始傾聽 action。收到 action 時會傳送給適當的 store。

### store

store 是儲存應用程式的邏輯與狀態資料的地方。store 類似 MVC 模式中的 model，但
store 不限於在單一物件中管理資料。Flux 應用程式可以由一個 store 管理不同的資料型別。

目前狀態資料可透過屬性從 store 取得。改變狀態時 store 所需的所有東西都來自
action，store 會依型別處理 action 並根據它改變其資料。資料異動時，store
會發出事件來通知訂閱此 store 的所有 view 有資料異動。讓我們參考以下範例：

```javascript
class CountdownStore extends EventEmitter {

  constructor(count = 5, dispatcher) {
    super();
    this._count = count;
    this.dispatcherIndex = dispatcher.register(
      this.dispatch.bind(this)
    );
  }

  get count() {
    return this._count;
  }

  dispatch(payload) {
    const {type, count} = payload.action;
    switch (type) {

      case 'TICK':
        this._count = this._count - 1;
        this.emit('TICK', this._count);
        return true;
      case 'RESET':
        this._count = count;
        this.emit('RESET', this._count);
        return true;
        
    }
  }

}
```

此 store 保存倒數應用程式的狀態，也就是計數。計數可透過唯讀屬性讀取。action
被分發時，store 使用它們來改變計數。TICK 會遞減計數，而 RESET 會以 action 中的資料重置計數。

狀態改變後，store 會發出事件給傾聽它的 view。

### 全部串起來

```javascript
const appDispatcher = new CountdownDispatcher();
const actions = countdownActions(appDispatcher);
const store = new CountdownStore(10, appDispatcher);

const render = count => ReactDOM.render(
  <Countdown count={count} {...actions} />,
  document.getElementById('react-container')
);

store.on('TICK', () => render(store.count));
store.on('RESET', () => render(store.count));
render(store.count);
```

### Flux 實作

- Flux
- Reflux
- Flummox
- Fluxible
- Redux

  類似 Flux 的函式庫，透過函式而非物件達成模組化

- MobX

  使用 observable 回應狀態異動的狀態管理函式庫

以上都是 Flux 設計模式的變化，其核心都是單向資料流。