const errors = require('@feathersjs/errors');
const { _ } = require('@feathersjs/commons');
const { sorter, select, AdapterService } = require('@feathersjs/adapter-commons');
const sift = require('sift').default;

const _select = (data, ...args) => {
  const base = select(...args);

  return base(JSON.parse(JSON.stringify(data)));
};

class Service extends AdapterService {
  constructor (options = {}) {
    super(_.extend({
      id: 'id',
      matcher: sift,
      sorter
    }, options));
    this._uId = options.startId || 0;
    this.store = options.store || {};
  }

  async getEntries (params = {}) {
    const { query } = this.filterQuery(params);

    return this._find(Object.assign({}, params, {
      paginate: false,
      query
    }));
  }

  async _find (params = {}) {
    const { query, filters, paginate } = this.filterQuery(params);
    let values = _.values(this.store);
    const total = values.length;
    const hasSkip = filters.$skip !== undefined;
    const hasSort = filters.$sort !== undefined;
    const hasLimit = filters.$limit !== undefined;
    const hasQuery = _.keys(query).length > 0;

    if (hasSort) {
      values.sort(this.options.sorter(filters.$sort));
    }

    if (hasQuery || hasLimit || hasSkip) {
      let skipped = 0;
      const matcher = this.options.matcher(query);
      const matched = [];

      for (let index = 0, length = values.length; index < length; index++) {
        const value = values[index];

        if (hasQuery && !matcher(value, index, values)) {
          continue;
        }

        if (hasSkip && filters.$skip > skipped) {
          skipped++;
          continue;
        }

        matched.push(_select(value, params));

        if (hasLimit && filters.$limit === matched.length) {
          break;
        }
      }

      values = matched;
    }

    const result = {
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: filters.$limit === 0 ? [] : values
    };

    if (!(paginate && paginate.default)) {
      return result.data;
    }

    return result;
  }

  async _get (id, params = {}) {
    if (id in this.store) {
      const { query } = this.filterQuery(params);
      const value = this.store[id];

      if (this.options.matcher(query)(value)) {
        return _select(value, params, this.id);
      }
    }

    throw new errors.NotFound(`No record found for id '${id}'`);
  }

  // Create without hooks and mixins that can be used internally
  async _create (data, params = {}) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this._create(current, params)));
    }

    const id = data[this.id] || this._uId++;
    const current = _.extend({}, data, { [this.id]: id });
    const result = (this.store[id] = current);

    return _select(result, params, this.id);
  }

  async _update (id, data, params = {}) {
    const oldEntry = await this._get(id);
    // We don't want our id to change type if it can be coerced
    const oldId = oldEntry[this.id];

    id = oldId == id ? oldId : id; // eslint-disable-line

    this.store[id] = _.extend({}, data, { [this.id]: id });

    return this._get(id, params);
  }

  async _patch (id, data, params = {}) {
    const patchEntry = entry => {
      const currentId = entry[this.id];

      this.store[currentId] = _.extend(this.store[currentId], _.omit(data, this.id));

      return _select(this.store[currentId], params, this.id);
    };

    if (id === null) {
      const entries = await this.getEntries(params);

      return entries.map(patchEntry);
    }

    return patchEntry(await this._get(id, params)); // Will throw an error if not found
  }

  // Remove without hooks and mixins that can be used internally
  async _remove (id, params = {}) {
    if (id === null) {
      const entries = await this.getEntries(params);

      return Promise.all(entries.map(
        current => this._remove(current[this.id], params))
      );
    }

    const entry = await this._get(id, params);

    delete this.store[id];

    return entry;
  }
}

module.exports = options => {
  return new Service(options);
};

module.exports.Service = Service;
