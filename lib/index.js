const Proto = require('uberproto');
const errors = require('@feathersjs/errors');

const { sorter, select, filterQuery, _ } = require('@feathersjs/commons');

const sift = require('sift');

const _select = (...args) => {
  const base = select(...args);

  return function (result) {
    return base(JSON.parse(JSON.stringify(result)));
  };
};

class Service {
  constructor (options = {}) {
    this.paginate = options.paginate || {};
    this._id = this.id = options.idField || options.id || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
    this.events = options.events || [];
    this._matcher = options.matcher;
    this._sorter = options.sorter || sorter;
  }

  extend (obj) {
    return Proto.extend(obj, this);
  }

  // Find without hooks and mixins that can be used internally and always returns
  // a pagination object
  _find (params, getFilter = filterQuery) {
    const { query, filters } = getFilter(params.query || {});
    const map = _select(params);
    let values = _.values(this.store);

    if (this._matcher) {
      values = values.filter(this._matcher(query));
    } else {
      values = sift(query, values);
    }

    const total = values.length;

    if (filters.$sort) {
      values.sort(this._sorter(filters.$sort));
    }

    if (filters.$skip) {
      values = values.slice(filters.$skip);
    }

    if (typeof filters.$limit !== 'undefined') {
      values = values.slice(0, filters.$limit);
    }

    return Promise.resolve({
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: map(values)
    });
  }

  find (params) {
    const paginate = typeof params.paginate !== 'undefined' ? params.paginate : this.paginate;
    // Call the internal find with query parameter that include pagination
    const result = this._find(params, query => filterQuery(query, paginate));

    if (!(paginate && paginate.default)) {
      return result.then(page => page.data);
    }

    return result;
  }

  get (id, params) {
    if (id in this.store) {
      return Promise.resolve(this.store[id])
        .then(_select(params, this.id));
    }

    return Promise.reject(
      new errors.NotFound(`No record found for id '${id}'`)
    );
  }

  // Create without hooks and mixins that can be used internally
  _create (data, params) {
    let id = data[this._id] || this._uId++;
    let current = _.extend({}, data, { [this._id]: id });

    return Promise.resolve((this.store[id] = current))
      .then(_select(params, this.id));
  }

  create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this._create(current)));
    }

    return this._create(data, params);
  }

  // Update without hooks and mixins that can be used internally
  _update (id, data, params) {
    if (id in this.store) {
      // We don't want our id to change type if it can be coerced
      const oldId = this.store[id][this._id];

      id = oldId == id ? oldId : id; // eslint-disable-line

      data = _.extend({}, data, { [this._id]: id });
      this.store[id] = data;

      return Promise.resolve(this.store[id])
        .then(_select(params, this.id));
    }

    return Promise.reject(
      new errors.NotFound(`No record found for id '${id}'`)
    );
  }

  update (id, data, params) {
    if (id === null || Array.isArray(data)) {
      return Promise.reject(new errors.BadRequest(
        `You can not replace multiple instances. Did you mean 'patch'?`
      ));
    }

    return this._update(id, data, params);
  }

  // Patch without hooks and mixins that can be used internally
  _patch (id, data, params) {
    if (id in this.store) {
      _.extend(this.store[id], _.omit(data, this._id));

      return Promise.resolve(this.store[id])
        .then(_select(params, this.id));
    }

    return Promise.reject(
      new errors.NotFound(`No record found for id '${id}'`)
    );
  }

  patch (id, data, params) {
    if (id === null) {
      return this._find(params).then(page => {
        return Promise.all(page.data.map(
          current => this._patch(current[this._id], data, params))
        );
      });
    }

    return this._patch(id, data, params);
  }

  // Remove without hooks and mixins that can be used internally
  _remove (id, params) {
    if (id in this.store) {
      const deleted = this.store[id];
      delete this.store[id];

      return Promise.resolve(deleted)
        .then(_select(params, this.id));
    }

    return Promise.reject(
      new errors.NotFound(`No record found for id '${id}'`)
    );
  }

  remove (id, params) {
    if (id === null) {
      return this._find(params).then(page =>
        Promise.all(page.data.map(current =>
          this._remove(current[this._id], params
          )
        )));
    }

    return this._remove(id, params);
  }
}

module.exports = function init (options) {
  return new Service(options);
};

module.exports.Service = Service;
