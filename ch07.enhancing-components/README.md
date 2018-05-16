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
呼叫並改變狀態已反映資料已載入