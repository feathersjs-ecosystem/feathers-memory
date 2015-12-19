import _ from 'lodash';

export const specialFilters = {
  $in(key, ins) {
    return current => ins.indexOf(current[key]) !== -1;
  },

  $nin(key, nins) {
    return current => nins.indexOf(current[key]) === -1;
  },

  $lt(key, value) {
    return current => current[key] < value;
  },

  $lte(key, value) {
    return current => current[key] <= value;
  },

  $gt(key, value) {
    return current => current[key] > value;
  },

  $gte(key, value) {
    return current => current[key] >= value;
  },

  $ne(key, value) {
    return current => current[key] !== value;
  }
};

export function filterSpecials(values, query) {
  if(query.$or) {
    values = values.filter(current =>
      _.some(query.$or, or => _.isMatch(current, or)));
    delete query.$or;
  }

  _.each(query, (value, key) => {
    if(_.isObject(value)) {
      _.each(value, (target, prop) => {
        if(specialFilters[prop]) {
          values = values.filter(specialFilters[prop](key, target));
        }
      });

      delete query[key];
    }
  });

  return values;
}

export function sorter($sort) {
  return (first, second) => {
    let comparator = 0;
    _.each($sort, (modifier, key) => {
      modifier = parseInt(modifier, 10);
      
      if(first[key] < second[key]) {
        comparator -= 1 * modifier;
      }

      if(first[key] > second[key]) {
        comparator += 1 * modifier;
      }
    });
    return comparator;
  };
}
