/*jshint expr: true*/

import baseTests from 'feathers-service-tests';
import errors from 'feathers-errors';
import memory from '../src';

const _ids = {};
const people = memory();

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
    }, {}, (error, data) => {
      if (error) {
        console.error(error);
      }

      _ids.Doug = data.id;
      done();
    });
  });

  afterEach(done => {
    people.remove(_ids.Doug, {}, (error) => {
      if (error) {
        console.error(error);
      }

      done();
    });
  });

  baseTests(people, _ids, errors.types);
});
