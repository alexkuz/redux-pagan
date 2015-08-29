import memoize from 'lodash.memoize';

function getLangString(data, fullpath) {
  if (fullpath.filter(key => typeof key !== 'string').length > 0) {
    console.error('Invalid langpack path: ', fullpath); // eslint-disable-line no-console
  }

  const str = fullpath.reduce(
    (obj, key, idx) => (idx === fullpath.length - 1) ?
      ((obj && (obj[key] !== undefined)) ? obj[key].toString() : key) :
      ((obj && obj[key]) ? obj[key] : null),
    data
  );

  if (str && !(typeof str === 'string')) {
    console.warn('String expected, got: ', str); // eslint-disable-line no-console
  }

  return str;
}

function concatPath(locale, data, path, subpath) {
  if (subpath.length === 0) {
    return getLangString(data, path);
  }
  const _path = [...path, ...subpath];

  const i18nPartial = function(..._subpath) {
    return concatPath(locale, data, _path, _subpath);
  };

  const memoizedI18nPartial = memoize(i18nPartial, function(..._subpath) {
    return [locale, ..._path, ..._subpath].join(',');
  });

  memoizedI18nPartial.toString = function() {
    return getLangString(data, _path);
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

  memoizedI18nPartial[Symbol.iterator] = function *() {
    yield memoizedI18nPartial.toString();
  }

  return memoizedI18nPartial;
}

export default memoize(function i18nResolver(locale, data, ...path) {
  return concatPath(locale, data, [], path);
}, function(locale, data, ...path) {
  return [locale, ...path].join(',');
});
