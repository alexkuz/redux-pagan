import { LOAD_LANG_SUCCESS } from './actionTypes';
import i18nResolver from './i18nResolver';

const DEFAULT_STATE = {
  get(...args) {
    return i18nResolver(null, {}, 0, ...args);
  },
  __version__: 0
};

const mergeLang = (state, action) => ({
  ...state,
  data: {
    ...state.data,
    [action.locale]: action.lang
  },
  locale: action.locale,
  get(...args) {
    return i18nResolver(this.locale, this.data[this.locale], this.__version__, ...args);
  },
  __version__: state.__version__ + 1
});

export default function i18n(state = DEFAULT_STATE, action) {
  return (({
    [LOAD_LANG_SUCCESS]: mergeLang
  })[action.type] || (s => s))(state, action);
}
