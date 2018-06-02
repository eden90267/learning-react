# Chap 11. React Router

網際網路剛開始時，大部分的網站由一系列網頁組成。在基於網頁或伺服器繪製的網站上，瀏覽器上下頁按鈕、書籤儲存特定檔案與歷史紀錄運作如我們預期。

在單頁應用程式中，所有事情都發生在同一頁。JavaScript 會載入資訊並更新 UI。歷史紀錄、書籤、上下頁等瀏覽器功能在沒有路由解決方案時無法運作。**路由**是為用戶端的請求定義端點的程序。這些端點與瀏覽器的位置以及歷史紀錄物件一同運作，它們用於識別請求的內容以供 JavaScript 載入與繪製合適的使用者介面。

不像 Angular、Ember 或 Backbone，React 沒有標準的路由。Michael Jackson 與 Ryan Florence 發現路由的重要性後開發了 React Router 的解決方案。React Router 被社群大量採用以作為 React 應用程式的路由解決方案。Uber、Zendesk、PayPel 與 Vimeo 等公司都有使用。

這一章介紹 React Router 並檢視如何利用 HashRouter 元件在用戶端處理路由。

## 使用 Router

為示範 React Router 的功能，我們會建構具有 About、Events、Products 與 Contact Us 部分的傳統基本網站。雖這網站看起來像多個網頁，但其實只有一頁：它是一個 SPA。

此網站的網站地圖由首頁、各個部分與處理 404 Not Found 錯誤的錯誤頁組成：

```
- Home Page                  - http://localhost:3000/
  - About the Company          - http://localhost:3000/#/about
  - Events                     - http://localhost:3000/#/events
  - Products                   - http://localhost:3000/#/products
  - Contact Us                 - http://localhost:3000/#/contact
- 404 Error Page             - http://localhost:3000/#/foo-bar
```

router 可讓我們設定每個部分的路由。每個路由是可從瀏覽器的位置列輸入的端點。對路由請求時，我們可繪製合適的內容。

> Top! HashRouter  
> react-router-dom 提供幾個單頁應用程式管理瀏覽紀錄的選項。HashRouter 是為用戶端設計。傳統上，井號 (#) 用於定義 anchor 連結。當 # 用於位置列時，瀏覽器不會向伺服器發出請求。使用 HashRouter 時，所有路由前面都必須有 #。
>
> HashRouter 適用於新專案或不需要後台的小網站。BrowserRouter 是適合大部分上線應用程式的解決方案。我們會在 Ch12 討論通用應用程式時討論 BrowserRouter。

讓我們安裝 react-router-dom，它是在基於瀏覽器的應用程式中使用 router 時我們需要的套件：

```shell
$ npm i react-router-dom --save
```

網站地圖中每個部分或網頁還需要幾個佔位用元件，我們可以從單一檔案中匯出這些元件：

```javascript
// src/pages.js
export const Home = () =>
  <section className="home">
    <h1>[Home Page]</h1>
  </section>;

export const About = () =>
  <section className="about">
    <h1>[About the Company]</h1>
  </section>;

export const Events = () =>
  <section className="events">
    <h1>[Events Calendar]</h1>
  </section>;

export const Products = () =>
  <section className="products">
    <h1>[Products Catalog]</h1>
  </section>;

export const Contact = () =>
  <section className="contact">
    <h1>[Contact Us]</h1>
  </section>;
```

應用程式啟動時，相較於繪製單一 App 元件，我們會繪製 HashRouter 元件：

```javascript
// src/index.js
import React from 'react';
import {render} from 'react-dom';

import {HashRouter, Route} from 'react-router-dom';

import {
  Home,
  About,
  Events,
  Products,
  Contact
} from './pages'

window.React = React;

render(
  <HashRouter>
    <div className="main">
      <Route exact path="/" component={Home}/>
      <Route exact path="/about" component={About}/>
      <Route exact path="/events" component={Events}/>
      <Route exact path="/products" component={Products}/>
      <Route exact path="/contact" component={Contact}/>
    </div>
  </HashRouter>,
  document.getElementById('react-container')
);
```

HashRouter 元件作為應用程式的根元件繪製。每個路由在 HashRouter 中以 Route 元件定義。

這些路由告訴 router 當 window 的 location 改變時要繪製哪一個元件。每個 Route 元件有 path 與 component 屬性。瀏覽器的 location 與 path 相符就顯示 component。

exact 屬性，這表示 Home 元件只會在 location 完全符合根的 / 路徑時顯示 Home 元件。

執行應用程式後，瀏覽器位置列輸入：[http://localhost:3000/#/about](http://localhost:3000/#/about) 並檢視繪製 About 元件。

不過我們並不認為使用者會以輸入路由的方式瀏覽網站。react-router-dom 提供 Link 元件可用於建構瀏覽器連結。

修改首頁以包含每個路由的連結選單：

```javascript
export const Home = () =>
  <section className="home">
    <h1>[Company Website]</h1>
    <nav>
      <Link to="about">[About]</Link>
      <Link to="events">[Events]</Link>
      <Link to="products">[Products]</Link>
      <Link to="contact">[Contact Us]</Link>
    </nav>
  </section>;
```

這樣使用者可從首頁點擊連結以存取內部網頁。瀏覽器的上一頁按鈕會回到上一頁。

### Router 屬性

React Router 傳遞屬性給它繪製的元件。舉例來說，我們可以提供屬性取得目前位置。讓我們使用目前位置來建構 404 Not Found 元件：

```javascript
export const Whoops404 = ({location}) =>
  <div className="whoops-404">
    <h1>Resource not found at '{location.pathname}'</h1>
  </div>;
```

Whoops404 元件會在使用者輸入未定義的路由時繪製。繪製後，路由會將位置物間以屬性傳給此元件。可使用此物件以獲得請求路由的路徑名稱。

讓我們將 Whoops404 元件加到使用 Route 的應用程式：

```javascript
import React from 'react';
import {render} from 'react-dom';

import {HashRouter, Route, Switch} from 'react-router-dom';

import {
  Home,
  About,
  Events,
  Products,
  Contact,
  Whoops404
} from './pages'

window.React = React;

render(
  <HashRouter>
    <div className="main">
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/events" component={Events}/>
        <Route path="/products" component={Products}/>
        <Route path="/contact" component={Contact}/>
        <Route component={Whoops404}/>
      </Switch>
    </div>
  </HashRouter>,
  document.getElementById('react-container')
);
```

由於我們只想要在沒有 Route 符合時顯示 Whoops404 元件，因此需要使用到 Switch 元件。Switch 元件只顯示相符的第一個路由，如此能確保只有繪製一個相符路由。若沒有位置符合 Route，最後的路由 —— 沒有 path 屬性的路由 —— 會被顯示。

這節介紹了 React Router 的基本實作與運作。Route 元件必須包裝在 router 中，在 HashRouter 中，它根據 window 目前的 location 選取要繪製的元件。Link 元件用於製作瀏覽連結。這些基本元素就很足夠，但 router 還有很多功能。

## 嵌套路由

Route 元件用於符合特定 URL 時顯示特定內容。此功能可讓我們以階層安排內容並促進重複使用。

這一節還討論如何安排內容成具有子選單的子部分。

### 使用網頁模版

使用者在應用程式中移動，我們想要某些 UI 維持在原處。以前的作法是用網頁模版與主網頁幫助開發者重複使用 UI 元素。React 元件可使用 children 屬性組成模板。

簡單基本網站為例，每一部分都應該顯示相同的主選單。

讓我們建構可重複使用的 PageTemplate 元件作為這些網頁的模板。此元件固定顯示主選單，但隨著使用者瀏覽位置繪製嵌套的內容。

```javascript
// src/menus.js
import HomeIcon from 'react-icons/lib/fa/home';
import {NavLink} from "react-router-dom";

const selectedStyle = {
  backgroundColor: 'White',
  color: 'slategray'
};

export const MainMenu = () =>
  <nav className="main-menu">
    <NavLink to="/">
      <HomeIcon/>
    </NavLink>
    <NavLink to="/about" activeStyle={selectedStyle}>
      [About]
    </NavLink>
    <NavLink to="/events" activeStyle={selectedStyle}>
      [Events]
    </NavLink>
    <NavLink to="/products" activeStyle={selectedStyle}>
      [Products]
    </NavLink>
    <NavLink to="/contact" activeStyle={selectedStyle}>
      [Contact Us]
    </NavLink>
  </nav>;
```

NavLink 元件建構依動作變化樣式連結。activeStyle 屬性設定 CSS 以表示連結動作中或被選取。

MainMenu 元件會被 PageTemplate 元件使用：

```javascript
const PageTemplate = ({children}) =>
  <div className="page">
    <MainMenu/>
    {children}
  </div>;
```

PageTemplate 元件的子元件是繪製每個部分的元件。我們在 MainMenu 後面加上子元件。現在可使用 PageTemplate 組合每個部分：

```javascript
export const About = () =>
  <PageTemplate>
    <section className="about">
      <h1>[About the Company]</h1>
    </section>
  </PageTemplate>;

export const Events = () =>
  <PageTemplate>
    <section className="events">
      <h1>[Events Calendar]</h1>
    </section>
  </PageTemplate>;

export const Products = () =>
  <PageTemplate>
    <section className="products">
      <h1>[Products Catalog]</h1>
    </section>
  </PageTemplate>;

export const Contact = () =>
  <PageTemplate>
    <section className="contact">
      <h1>[Contact Us]</h1>
    </section>
  </PageTemplate>;
```

執行此應用程式會看到每個部分顯示相同的 MainMenu。螢幕右邊內容隨著瀏覽內部網頁而改變。

### 子部分與子選單

接下來，我們會在 About 部分使用 Route 元件嵌套四個元件：

我們必須對 Company、History、Services 與 Location 部分加上網頁。使用者選取 About 部分時應該會看到預設為它下面的 Company 網頁。

- Home Page
  - About the Company
    - Company (default)
    - History
    - Services
    - Location
  - Events
  - Products
  - Contact Us
- 404 Error Page

我們必須建構新的路由以反映這個階層：

- http://localhost:3000/
  - http://localhost:3000/#/about
    - http://localhost:3000/#/about
    - http://localhost:3000/#/history
    - http://localhost:3000/#/services
    - http://localhost:3000/#/location
  - http://localhost:3000/#/events
  - http://localhost:3000/#/products
  - http://localhost:3000/#/contact
- http://localhost:3000/#/foo-bar

讓我們建構 About 部分的子選單：

```javascript
export const AboutMenu = ({match}) =>
  <div className="about-menu">
    <li>
      <NavLink to="/about"
               style={match.isExact && selectedStyle}>
        [Company]
      </NavLink>
    </li>
    <li>
      <NavLink to="/about/history"
               style={selectedStyle}>
        [History]
      </NavLink>
    </li>
    <li>
      <NavLink to="/about/services"
               style={selectedStyle}>
        [Services]
      </NavLink>
    </li>
    <li>
      <NavLink to="/about/location"
               style={selectedStyle}>
        [Location]
      </NavLink>
    </li>
  </div>;
```

AboutMenu 元件使用 NavLink 元件將使用者導向 About 部分下的內容。此元件會使用 Route 繪製，這表示它會接收路由屬性。我們必須使用從 Route 傳給此元件的 match 屬性。

第一個 NavLink 元件未使用 activeStyle，相反的，樣式屬性只在路由完全符合 /about 時設成 selectedStyle。match.isExact 屬性在位置上是 /about 時為 true，在位置為 /about/services 時為 false。技術上 /about 路由與兩者皆符合，但只有在位置是 /about 時才完全相符。

佔位元件：

```javascript
export const Services = () =>
    <section className="services">
        <h2>Our Services</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
            Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
            Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur
            sodales ligula in libero.
        </p>
        <p>
            Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
            In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel
            nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis
            quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in,
            nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia
            nostra, per inceptos himenaeos.
        </p>
    </section>

export const Location = () =>
    <section className="location">
        <h2>Our Location</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
            Sed cursus ante dapibus diam.
        </p>
        <p>
            Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
            Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur
            sodales ligula in libero.
        </p>
        <p>
            Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
            In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel
            nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis
            quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in,
            nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia
            nostra, per inceptos himenaeos.
        </p>
    </section>

export const Company = () =>
    <section className="company">
        <h2>About the Company</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
            Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
            Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur
            sodales ligula in libero.
        </p>
        <p>
            Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
            In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel
            nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis
            quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in,
            nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia
            nostra, per inceptos himenaeos.
        </p>
    </section>

export const History = () =>
    <section className="history">
        <h2>Our History</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
            Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
            Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur
            sodales ligula in libero.
        </p>
        <p>
            Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
            In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel
            nunc egestas porttitor.
        </p>
        <p> Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis
            quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in,
            nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia
            nostra, per inceptos himenaeos.
        </p>
    </section>
```

現在我們可以對 About 元件加上路由：

```javascript
export const About = () =>
  <PageTemplate>
    <section className="about">
      <Route component={AboutMenu} />
      <Route exact path="/about" component={Company}/>
      <Route path="/about/history" component={History}/>
      <Route path="/about/services" component={Services}/>
      <Route path="/about/location" component={Location}/>
    </section>
  </PageTemplate>;
```

About 元件會在整個部分中重複使用。位置會告訴應用程式要繪製哪一個子部分。舉例來說，位置是 http://localhost:3000/about/history 時，History 元件會被繪製在 About 元件中。

這次，我們不使用 Switch 元件。任何符合位置的 Route 會以相關元件繪製。

### 使用 redirect

有時你想要將使用者從一個路由重新導向其他路由。舉例，我們可以在使用者嘗試存取 http://localhost:3000/services 內容時重新導向到正確的路由：http://localhost:3000/about/services。

讓我們修改應用程式以加入重新導向來確保使用者會存取正確的內容：

```javascript
import React from 'react';
import {render} from 'react-dom';

import {HashRouter, Redirect, Route, Switch} from 'react-router-dom';

import {
  Home,
  About,
  Events,
  Products,
  Contact,
  Whoops404
} from './pages'

window.React = React;

render(
  <HashRouter>
    <div className="main">
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Redirect from="/history" to="/about/history"/>
        <Redirect from="/services" to="/about/services"/>
        <Redirect from="/location" to="/about/location"/>
        <Route path="/events" component={Events}/>
        <Route path="/products" component={Products}/>
        <Route path="/contact" component={Contact}/>
        <Route component={Whoops404}/>
      </Switch>
    </div>
  </HashRouter>,
  document.getElementById('react-container')
);
```

Redirect 元件能讓我們將使用者重新導向特定路由。(針對使用者舊書籤存取網站很好用)

React Router 能讓我們在應用程式中組合 Route 元件，因為 HashRouter 是根元件。我們可以在階層中安排容易瀏覽的內容。

## Router 的參數

React Router 的另一個實用功能是設定**路由參數**。路由參數是從 URL
取得的變數值，它們在資料驅動的網站應用程式程式中對過濾內容或管理顯示偏好特別有用。

### 加上顏色細節頁

讓我們使用 React Router
加入選取與顯示個別顏色的功能，以改善顏色管理程式。使用者點擊顏色時，應用程式應該繪製該顏色並顯示
title 與 hex 值。

每個顏色有獨特的 ID。此 ID
可用來尋找儲存在狀態中的特定顏色。舉例來說，我們可以建構 findById 函式來依 id 欄尋找陣列中的物件：

```javascript
// src/lib/array.helper.js
export const getFirstArrayItem = array => array[0];

export const filterArrayById = (array, id) =>
  array.filter(item => item.id === id);

export const findById = compose(
  getFirstArrayItem,
  filterArrayById
);
```

findById 函式依循第二章討論的函式性程式設計技術。

使用 router 時，我們可以從 URL 取得顏色的 ID。舉例：

```
http://localhost:3000/#/58d9caee-6ea6-4d7b-9984-65b1450319979
```

router 參數能讓我們擷取這個值。它們可使用分號定義在路由中。舉例，我們可以擷取 id
並以 Route 將它儲存在稱為 id 的參數中：

```javascript
<Route exact path="/:id" component={UniqueIDHeader} />
```

UniqueIDHeader 元件可從 match.params 物件取得 id：

```javascript
const UniqueIDHeader = ({match}) => <h1>{match.params.id}</h1>
```

我們可與有需要時建構參數以從 URL 收集資料

#### 多個參數

同一個參數物件可建構多個參數。

```javascript
<Route path="/members/:gender/:state/:city" component={Member} />
```

這三個參數可透過 URL 初始化：

```
http://localhost:3000/members/female/california/truckee
```

這三個參數會透過 match.params 傳遞給 Member 元件：

```javascript
const Member = ({match}) =>
  <div className="member">
    <ul>
      <li>gender: {match.params.gender}</li>
      <li>state: {match.params.state}</li>
      <li>city: {match.params.city}</li>
    </ul>
  </div>
```

讓我們建構一個 ColorDetails 元件，當使用者選取一個顏色時將可被繪製：

```javascript
export const Color = connect(
  (state, props) =>
    findById(state.colors, props.match.params.id)
)(ColorDetails);
```

connect 這個 HOC 也會對應傳給 Color 容器的任何屬性給 ColorDetails
元件。這表示所有 router 屬性也會傳給 ColorDetails。

讓我們用所有 router 的歷史屬性對 ColorDetails 元件加上一些導航：

```javascript
const ColorDetails = ({title, color, history}) =>
  <div className="color-details"
       style={{backgroundColor: color}}
       onClick={() => history.goBack()}>
    <h1>{title}</h1>
    <h1>{color}</h1>
  </div>;
```

現在我們有 Color 容器，必須將它加入應用程式中。首先，必須在首次繪製時以
HashRouter 包裝 App 元件。

```javascript
// src/index.js
import {HashRouter} from 'react-router-dom';

render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('react-container')
);
```

現在我們可在應用程式中設定路由。讓我們在 App 元件中加上一些路由。

```javascript
// src/components/App.js
import {Menu, NewColor, Colors} from "./containers";
import '../../stylesheets/APP.scss'
import {Route, Switch} from "react-router-dom";
import Color from "./ui/Color";

const App = () =>
  <Switch>
    <Route exact path="/:id" component={Color}/>
    <Route path="/" component={() =>
      <div className="app">
        <Menu/>
        <NewColor/>
        <Colors/>
      </div>
    }/>
  </Switch>;

export default App;
```

Switch 元件用於繪製兩個路由其中之一：個別顏色或應用程式主元件。第一個 Router 於
URL 有傳入 id 時繪製 Color 元件。舉例來說，下面路徑與路由相符：

```
http://localhost:3000/#/58d9caee-6ea6-4d7b-9984-65b1450319979
```

其他路徑會與 / 相符並顯示應用程式主元件。第二個 Route
在新的不具名無狀態函式性元件下組合多個元件，因此使用者會依 URL 看到個別顏色或顏色清單。

此時不使用 NavLink 元件來處理從顏色清單到顏色細節的瀏覽，而是直接使用 router 的
history 物件。

讓我們對 ./ui 目錄中的 Color 元件加上導航。此元件由 ColorList 繪製。它未接收來自
Route 的路由屬性。你可在樹中明確向下傳遞這些屬性到 Color 元件。但使用 withRouter
函式比較方便。react-router-dom 內建的 WithRouter 函式可將路由屬性加到 Route 下繪製的任何元件中。

我們使用 withRouter 取得 router 作為屬性的 history 物件。我們可以使用它在
Color 元件中導航：

```javascript
import PropTypes from 'prop-types';
import StarRating from "./StarRating";
import FaTrash from 'react-icons/lib/fa/trash-o';
import '../../../stylesheets/Color.scss'
import TimeAgo from "./TimeAgo";
import {withRouter} from "react-router-dom";


const Color = ({id, title, color, rating = 0, timestamp, onRemove = f => f, onRate = f => f, history}) =>
  <section className="color">
    <h1 onClick={() => history.push(`/${id}`)}>{title}</h1>
    <button onClick={onRemove}>
      <FaTrash/>
    </button>
    <div className="color"
         style={{backgroundColor: color}}
         onClick={() => history.push(`/${id}`)}>
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

export default withRouter(Color);
```

withRouter 是個 HOC。匯出 Color 元件時，我們將它傳送給 withRouter，以傳遞
router 的 match、history 與 location 屬性的元件包裝。

導航從 history 物件直接取得。使用者點擊顏色名稱或顏色本身，新的路由會加入 history
物件中。此新路由是帶有顏色的 id 字串，將此路由加入歷史會導致瀏覽的發生。

#### 單一事實來源

現在，顏色管理的狀態大部分由 Redux 的 store 處理。我們也有些狀態由 router
處理。特別是，若路由帶有顏色 ID，應用程式的顯示狀態與路由沒有 ID 不同。

讓 router 處理某些狀態似乎違反 Redux 對儲存狀態在單一物件中的要求，但你可以將
router 視為與瀏覽器對接的事實來源。讓 router
處理包括查詢資料的過濾在內與網站地圖有關的狀態是絕對 OK 的，其餘的狀態交給 Redux
的 store。

### 顏色排序狀態交給 Router

你無需限制 Router 參數的使用。它們不只能查詢狀態中的特定資料，還可取得繪製 UI 必要的資訊。

顏色應用程式裡 Redux 的 store 目前 store 變數是個字串，因此也適合作為路由參數。我們想要讓使用者能夠以連結傳送排序狀態給其他使用者。

讓我們將顏色的排序狀態交給路由參數：

- /#/預設值
- /#/sort/title
- /#/sort/rating

首先從 ./store/index.js 刪除排序的 reducer：

```javascript
const storeFactory = (initialState = stateData) =>
  applyMiddleware(logger, saver)(createStore)(
    combineReducers({colors}),
    (localStorage['redux-store']) ?
      JSON.parse(localStorage['redux-store']) :
      initialState
  );
```

./src/components/containers.js 刪除 Menu 容器。

此外，我們必須改變 containers.js 檔案中 Colors 容器。

```javascript
export const Colors = connect(
  // mapStateToProps
  ({colors}, {match}) => ({
    colors: sortColors(colors, match.params.sort)
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

接下來，以新路由的連結取代 Menu 元件：

```javascript
import {NavLink} from "react-router-dom";
import '../../../stylesheets/Menu.scss'

const selectedStyle = {
  color: 'red'
};

const Menu = ({match}) =>
  <nav className="menu">
    <NavLink to="/" style={match.isExact && selectedStyle}>
      date
    </NavLink>
    <NavLink to="/sort/title" activeStyle={selectedStyle}>
      title
    </NavLink>
    <NavLink to="/sort/rating" activeStyle={selectedStyle}>
      rating
    </NavLink>
  </nav>;

export default Menu;
```

首先，Menu 需要符合屬性，因此我們會以 Route 繪製 Menu。Menu 會與 NewColor
一起從顏色清單繪製，因為 Route 沒有路徑。

NewColor 之後，我們想要顯示預設排序或依屬性排序的顏色清單。這些路由包裝在 Switch
元件中以確保只會繪製一個 Colors 容器。

路由參數是取得影響使用者介面資料的好工具，但它們只應該供使用者在 URL
中擷取這些細節用。若想要讓使用者儲存展示的資訊到 URL 中，路由參數是合適的解決方案。

這一章討論了 React Router 的基本運用。這一章的範例都有使用到
HashRouter。下一章繼續在用戶端與伺服器使用此路由功能以及
BrowserRouter，我們會在伺服器使用 StaticRouter 繪製目前的路由內容。