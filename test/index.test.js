/*jshint expr: true*/

import { base, example } from 'feathers-service-tests';
import errors from 'feathers-errors';
import feathers from 'feathers';
import assert from 'assert';
import server from '../example/app';
import memory from '../src';

const _ids = {};
const app = feathers().use('/people', memory());
const people = app.service('people');

function clean() {
  people._uId = 0;
  people.store = {};
}

describe('Feathers Memory Service', () => {
  before(clean);
  after(clean);

  beforeEach(done => {
    people.create({
      name: 'Doug',
      age: 32
    }).then(data => {
      _ids.Doug = data.id;
      done();
    }, done);
  });

  afterEach(done => {
    const doneNow = () => done();
    people.remove(_ids.Doug).then(doneNow, doneNow);
  });

  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  base(people, _ids, errors.types);
});

describe('Memory service example test', () => {
  after(done => server.close(() => done()));

  example();
});
