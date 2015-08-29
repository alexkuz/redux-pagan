import { LOAD_LANG, LOAD_LANG_SUCCESS } from './actionTypes';


export function loadLang(locale, data) {
  return async dispatch => {
    dispatch({
      type: LOAD_LANG,
      locale
    });

    let loader = typeof data === 'function' ? data(locale) : data;
    let lang;

    if (typeof loader === 'function') {
      lang = await loader();
    } else {
      lang = loader;
    }

    dispatch({
      type: LOAD_LANG_SUCCESS,
      locale,
      lang
    });
  };
}
