import { LOAD_LANG_SUCCESS } from './actionTypes';

const DEFAULT_STATE = {
  __version__: 0,
  locale: null,
  data: {}
};

const mergeLang = (state, { locale, lang }) => ({
  ...state,
  data: {
    ...state.data,
    [locale]: lang
  },
  locale,
  __version__: state.__version__ + 1
});

export default function i18n(state = DEFAULT_STATE, action) {
  return (({
    [LOAD_LANG_SUCCESS]: mergeLang
  })[action.type] || (s => s))(state, action);
}
