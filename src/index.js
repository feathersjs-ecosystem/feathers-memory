if(!global._babelPolyfill) { require('babel-polyfill'); }

import Proto from 'uberproto';
import filter from 'feathers-query-filters';
import errors from 'feathers-errors';
import { sorter, filterSpecials } from './utils';

const _ = {
  values: require('lodash/values'),
  isEmpty: require('lodash/isEmpty'),
  where: require('lodash/filter'),
  extend: require('lodash/extend'),
  omit: require('lodash/omit'),
  pick: require('lodash/pick')
};

class Service {
  constructor(options = {}) {
    this.paginate = options.paginate || {};
    this._id = options.idField || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
  }

  extend(obj) {
    return Proto.extend(obj, this);
  }
  
  // Find without hooks and mixins that can be used internally and always returns
  // a pagination object
  _find(params, getFilter = filter) {
    const query = params.query || {};
    const filters = getFilter(query);

    let values = filterSpecials(_.values(this.store), query);

    if(!_.isEmpty(query)) {
      values = _.where(values, query);
    }

    const total = values.length;

		if(filters.$sort) {
      values.sort(sorter(filters.$sort));
		}

		if(filters.$skip){
      values = values.slice(filters.$skip);
		}

		if(filters.$limit) {
      values = values.slice(0, filters.$limit);
		}

    if(filters.$select) {
      values = values.map(value => _.pick(value, filters.$select));
    }

    return Promise.resolve({
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: values
    });
  }
  
  find(params) {
    // Call the internal find with query parameter that include pagination
    const result = this._find(params, query => filter(query, this.paginate));
    
    if(!this.paginate.default) {
      return result.then(page => page.data);
    }
    
    return result;
  }

  get(id) {
    if (id in this.store) {
      return Promise.resolve(this.store[id]);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }
  
  // Create without hooks and mixins that can be used internally
  _create(data) {
    let id = data[this._id] || this._uId++;
    let current = _.extend({}, data, { [this._id]: id });

    if (this.store[id]){
      return Promise.reject(new errors.Conflict(`A record with id: ${id} already exists`));
    }

    return Promise.resolve((this.store[id] = current));
  }
  
  create(data) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this._create(current)));
    }

    return this._create(data);
  }
  
  // Update without hooks and mixins that can be used internally
  _update(id, data) {
    if (id in this.store) {
      data = _.extend({}, data, { [this._id]: id });
      this.store[id] = data;

      return Promise.resolve(this.store[id]);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }

  update(id, data) {
    if(id === null || Array.isArray(data)) {
      return Promise.reject(new errors.BadRequest(
        `You can not replace multiple instances. Did you mean 'patch'?`
      ));
    }

    return this._update(id, data);
  }
  
  // Patch without hooks and mixins that can be used internally
  _patch(id, data) {
    if (id in this.store) {
      _.extend(this.store[id], _.omit(data, this._id));

      return Promise.resolve(this.store[id]);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }

  patch(id, data, params) {
    if(id === null) {
      return this._find(params).then(page => {
        return Promise.all(page.data.map(
          current => this._patch(current[this._id], data, params))
        );
      });
    }

    return this._patch(id, data, params);
  }

  // Remove without hooks and mixins that can be used internally
  _remove(id) {
    if (id in this.store) {
      const deleted = this.store[id];
      delete this.store[id];

      return Promise.resolve(deleted);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }
  
  remove(id, params) {
    if(id === null) {
      return this._find(params).then(page =>
        Promise.all(page.data.map(current => this._remove(current[this._id])
      )));
    }

    return this._remove(id);
  }
}

export default function init(options) {
  return new Service(options);
}

init.Service = Service;
