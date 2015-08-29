import { LOAD_LANG, LOAD_LANG_SUCCESS } from './actionTypes';
import i18nResolver from './i18nResolver';

const DEFAULT_STATE = {
  get(...args) {
    return i18nResolver(null, {}, ...args);
  }
};

const mergeLang = (state, action) => ({
  ...state,
  data: {
    ...state.data,
    [action.locale]: action.lang
  },
  locale: action.locale,
  get(...args) {
    return i18nResolver(this.locale, this.data[this.locale], ...args);
  }
});

export default function i18n(state = DEFAULT_STATE, action) {
  return (({
    [LOAD_LANG_SUCCESS]: mergeLang
  })[action.type] || (s => s))(state, action);
}
