import { base, example } from 'feathers-service-tests';
import errors from 'feathers-errors';
import feathers from 'feathers';
import assert from 'assert';
import server from './test-app';
import memory from '../src';

describe('Feathers Memory Service', () => {
  const events = [ 'testing' ];
  const app = feathers()
    .use('/people', memory({ events }))
    .use('/people-customid', memory({
      id: 'customid', events
    }));

  it('is CommonJS compatible', () =>
    assert.equal(typeof require('../lib'), 'function')
  );

  it('update with string id works', () =>
    app.service('people').create({
      name: 'Tester',
      age: 33
    }).then(person =>
      app.service('people')
        .update(person.id.toString(), person)
        .then(updatedPerson =>
          assert.equal(typeof updatedPerson.id, 'number')
        )
        .then(() => app.service('people')
        .remove(person.id.toString()))
    )
  );

  it('allows to pass custom sorter', () => {
    let sorterCalled = false;

    app.use('/sorter', memory({
      sorter () {
        sorterCalled = true;
        return function () {
          return 0;
        };
      }
    }));

    return app.service('sorter').find({
      query: { $sort: { something: 1 } }
    }).then(() => {
      assert.ok(sorterCalled, 'sorter called');
    });
  });

  it('does not modify the original data', () => {
    const people = app.service('people');

    return people.create({
      name: 'Delete tester',
      age: 33
    }).then(person => {
      delete person.age;

      return people.get(person.id);
    }).then(person => {
      assert.equal(person.age, 33);

      return people.remove(person.id);
    });
  });

  base(app, errors);
  base(app, errors, 'people-customid', 'customid');
});

describe('Memory service example test', () => {
  after(done => server.close(() => done()));

  example();
});
