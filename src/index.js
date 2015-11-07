import _ from 'lodash';
import Proto from 'uberproto';
import filter from 'feathers-query-filters';
import { types as errors } from 'feathers-errors';

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

function filterSpecials(values, query) {
  if(query.$or) {
    values = values.filter(current => {
      return _.some(query.$or, or => _.isMatch(current, or));
    });
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

function sorter($sort) {
  return (first, second) => {
    let comparator = 0;
    _.each($sort, (modifier, key) => {
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

const MemoryService = Proto.extend({
  init(options) {
    options = options || {};

    this.type = 'memory';
    this._id = options.idField || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
  },

  find(params, cb) {
    const query = params.query || {};
    const filters = filter(query);

    let values = filterSpecials(_.values(this.store), query);

    if(!_.isEmpty(query)) {
      values = _.where(values, query);
    }

		// Handle $sort
		if (filters.$sort) {
      values.sort(sorter(filters.$sort));
		}

		if (filters.$skip){
      values = values.slice(parseInt(filters.$skip, 10));
		}

		if (filters.$limit){
      values = values.slice(0, parseInt(filters.$limit, 10));
		}

    if(filters.$select) {
      values = values.map(value => _.pick(value, filters.$select));
    }

    cb(null, values);
  },

  get(id, params, cb) {
    if(typeof id === 'function') {
      return id(new errors.BadRequest('An id needs to be provided'));
    }

    if (id in this.store) {
      return cb(null, this.store[id]);
    }

    cb(new errors.NotFound(`No record found for id '${id}'`));
  },

  create(data, params, cb) {
    var id = data[this._id] || this._uId++;
    data = _.extend({}, data, { [this._id]: id });

    if (this.store[id]){
      return cb(new errors.Conflict('A record with id: ' + id + ' already exists'));
    }

    this.store[id] = data;

    cb(null, data);
  },

  update(id, data, params, cb) {
    if (id in this.store) {
      data = _.extend({}, data, { [this._id]: id });
      this.store[id] = data;

      return cb(null, this.store[id]);
    }

    cb(new errors.NotFound(`No record found for id '${id}'`));
  },

  patch(id, data, params, cb) {
    if (id in this.store) {
      _.each(data, (value, key) => {
        if(key !== this._id) {
          this.store[id][key] = value;
        }
    });

      return cb(null, this.store[id]);
    }

    cb(new errors.NotFound(`No record found for id '${id}'`));
  },

  remove(id, params, cb) {
    if (id in this.store) {
      const deleted = this.store[id];
      delete this.store[id];

      return cb(null, deleted);
    }

    cb(new errors.NotFound(`No record found for id '${id}'`));
  }
});

module.exports = function(options) {
  return Proto.create.call(MemoryService, options);
};

module.exports.Service = MemoryService;
