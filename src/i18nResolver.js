import memoize from 'lodash.memoize';
import IntlMessageFormat from 'intl-messageformat';

/* eslint-disable no-console */

function isEmpty(data) {
  return !data || Object.keys(data).length === 0;
}

const emptyLocaleDataWarned = {};
const notFoundKeyWarned = {};

function getLangString(locale, data, fullpath) {
  if (fullpath.filter(key => typeof key !== 'string').length > 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Invalid langpack path: ', fullpath);
    }
  }

  const str = fullpath.reduce(
    (obj, key, idx) => {
      if (idx === fullpath.length - 1) {
        if (obj && (obj[key] !== undefined)) {
          return obj[key].toString();
        } else {
          const keyPath = `${locale}:${fullpath.join('/')}`;
          if (!isEmpty(data) && !notFoundKeyWarned[keyPath]) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Redux-Pagan: key was not found at path: ${keyPath}`);
            }
            notFoundKeyWarned[keyPath] = true;
          }
          return key;
        }
      } else {
        return (obj && obj[key]) ? obj[key] : null
      }
    },
    data
  );

  if (str && !(typeof str === 'string')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('String expected, got: ', str);
    }
  }

  return str;
}

function concatPath(locale, data, path, subpath) {
  if (isEmpty(data) && !emptyLocaleDataWarned[locale]) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Redux-Pagan: got empty data for locale '${locale}'`);
    }
    emptyLocaleDataWarned[locale] = true;
  }

  if (subpath.length === 0) {
    return getLangString(locale, data, path);
  }
  const _path = [...path, ...subpath];

  const i18nPartial = function(..._subpath) {
    return concatPath(locale, data, _path, _subpath);
  };

  const memoizedI18nPartial = memoize(i18nPartial, function(..._subpath) {
    return [locale, ..._path, ..._subpath].join(',');
  });

  memoizedI18nPartial.toString = function() {
    return getLangString(locale, data, _path);
  }

  memoizedI18nPartial.format = function(values) {
    const str = getLangString(locale, data, _path);
    const formatter = new IntlMessageFormat(str, locale);
    return formatter.format(values);
  }

  Object.defineProperty(memoizedI18nPartial, 's', {
    get() { return this.toString(); }
  });

  // proxy string methods
  Object.getOwnPropertyNames(String.prototype).forEach(prop => {
    if (typeof String.prototype[prop] === 'function' &&
      ['constructor', 'toString', 'valueOf'].indexOf(prop) === -1) { // find more elegant way maybe
      Object.defineProperty(memoizedI18nPartial, prop, {
        get() { return this.toString()[prop]; }
      });
    }
  });

  const desc = Object.getOwnPropertyDescriptor(memoizedI18nPartial, Symbol.iterator);

  if (!desc || desc.configurable) {
    memoizedI18nPartial[Symbol.iterator] = function *() {
      yield memoizedI18nPartial.toString();
    }
  }

  return memoizedI18nPartial;
}

/* eslint-enable no-console */

export default memoize(function i18nResolver(locale, data, version, ...path) {
  return concatPath(locale, data, [], path);
}, function(locale, data, version, ...path) {
  return [locale, version, ...path].join(',');
});
