const { base } = require('feathers-service-tests');
const errors = require('@feathersjs/errors');
const feathers = require('@feathersjs/feathers');
const assert = require('assert');

const memory = require('../lib');

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

  it('allows to pass custom find and sort matcher', () => {
    let sorterCalled = false;
    let matcherCalled = false;

    app.use('/matcher', memory({
      matcher () {
        matcherCalled = true;
        return function () {
          return true;
        };
      },

      sorter () {
        sorterCalled = true;
        return function () {
          return 0;
        };
      }
    }));

    return app.service('matcher').find({
      query: { $sort: { something: 1 } }
    }).then(() => {
      assert.ok(sorterCalled, 'sorter called');
      assert.ok(matcherCalled, 'matcher called');
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

  it('does not $select the id', () => {
    const people = app.service('people');

    return people.create({
      name: 'Tester'
    }).then(person => people.find({
      query: {
        name: 'Tester',
        $select: ['name']
      }
    }).then(person => {
      assert.deepEqual(person[0], { name: 'Tester' }, 'deepEquals the same');
    }).then(() => people.remove(person.id)));
  });

  base(app, errors);
  base(app, errors, 'people-customid', 'customid');
});
