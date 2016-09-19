# redux-pagan
managing internationalization via redux

(see `react-pagan` [demo](http://alexkuz.github.io/react-pagan/))

#### Setup redux store

Include i18n reducer in redux:

```js
import { i18n } from 'redux-pagan';

const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore);

const rootReducer = combineReducers({
  i18n
});

const store = createStoreWithMiddleware(rootReducer);
...
```

#### Loading lang data

```js
import { loadLang } from 'redux-pagan';

function getLangData(locale) {
  // here we use promise-loader to load lang data by demand
  return require('promise?global,[name].i18n!json!./i18n/' + locale + '.i18n.json');
}

@connect(...)
class App extends Component {
  componentDidMount() {
    this.props.dispatch(loadLang(cookie.get('lang') || 'en-US', getLangData));
  }
  
  render() {
    return (
      <select onChange={this.handleLocaleChange}
              value={this.props.locale}>
        <option value='en-US'>en-US</option>
        <option value='ru-RU'>ru-RU</option>
        <option value='fi-FI'>fi-FI</option>
      </select>
    );
  }
  
  handleLocaleChange = e => {
    this.props.dispatch(loadLang(e.target.value, getLangData));
  }
}
```

#### Using lang data

`getLang(state.i18n, ...path)` is a special method that safely obtains strings from lang data. If no strings were found on stated path, last key is returned. This method's calling is chainable:
```js
getLang(state.i18n, 'some', 'path', 'to')('lang', 'string')
```
Every call is memoized. To receive string value from last call, use `.toString()` or `.s` property (it's also smart enough to be used as React element without calling `.toString()` or `.s` - **NB**: for this to work, you'll need a `Symbol` polyfill)

```js
// in this case lang data looks like:
//  {
//    "app": {
//      "some": {
//        "text": "foobar"
//      },
//      "element": {
//        "something": {
//          "else": "foobar"
//        }
//      }
//    }
//  }

import { connect } from 'react-redux';
import { getLang } from 'redux-pagan';

@connect(state => ({
  lang: getLang(state.i18n, 'app'),
  locale: state.i18n.locale
}))
class App extends Component {
  render() {
    // string methods are proxied, no need to call .toString() either
    const str = this.props.lang('some', 'text').replace('foo', 'bar');

    return (
      <div>
        {this.props.lang('some', 'text')}
        <Element lang={this.props.lang('element')} />
      </div>
    );
  }
}

class Element extends Component {
  render() {
    return (
      <div>
        {this.props.lang('something', 'else')}
      </div>
    );
  }
}
```

