# feathers-memory

[![Build Status](https://travis-ci.org/feathersjs/feathers-memory.png?branch=master)](https://travis-ci.org/feathersjs/feathers-memory)

> An in memory CRUD service for Feathers.


## Installation

```bash
npm install feathers-memory --save
```


## Getting Started

You can create an in-memory service with no options:

```js
var memory = require('feathers-memory');
app.use('/todos', memory());
```

This will create a `todos` datastore with the default configuration.

## Complete Example

Here is an example of a Feathers server with a `todos` in-memory service that supports pagination:

```js
// app.js
var feathers = require('feathers');
var bodyParser = require('body-parser');
var memory = require('feathers-memory');

// Create a feathers instance.
var app = feathers()
  // Enable Socket.io
  .configure(feathers.socketio())
  // Enable REST services
  .configure(feathers.rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/todos', memory({
  paginate: {
    default: 2,
    max: 4
  }
}));

// Create a dummy Todo
app.service('todos').create({
  text: 'Server todo',
  complete: false
}).then(function(todo) {
  console.log('Created todo', todo);
});

// Start the server.
var port = 3030;

app.listen(port, function() {
  console.log('Feathers server listening on port ' + port);
});
```

You can run this example by using `node examples/app` and going to [localhost:3030/todos](http://localhost:3030/todos). You will see the test Todo that we created at the end of that file.

## Extending

There are several ways to extend the basic CRUD functionality of this service. Keep in mind that calling the original service methods will return a Promise that resolves with the value.

### feathers-hooks

The most flexible option is weaving in functionality through [feathers-hooks](https://github.com/feathersjs/feathers-hooks), for example, `createdAt` and `updatedAt` timestamps could be added like this:

```js
var feathers = require('feathers');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');

var app = feathers()
  .configure(hooks())
  .use('/todos', memory({
    paginate: {
      default: 2,
      max: 4
    }
  }));

app.service('todos').before({
  create: function(hook, next) {
    hook.data.createdAt = new Date();
    next();
  },

  update: function(hook, next) {
    hook.data.updatedAt = new Date();
    next();
  }
});

app.listen(3030);
```

### Classes (ES6)

The module also exports a Babel transpiled ES6 class as `Service` that can be directly extended like this:

```js
import { Service } from 'feathers-memory';

class MyService extends Service {
  create(data, params) {
    data.created_at = new Date();

    return super.create(data, params).then(todo);
  }
}

app.use('/todos', new MyService({
  paginate: {
    default: 2,
    max: 4
  }
}));
```

### Uberproto (ES5)

You can also use `.extend` on a service instance (extension is provided by [Uberproto](https://github.com/daffl/uberproto)):

```js
var myService = memory({
  paginate: {
    default: 2,
    max: 4
  }
}).extend({
  create: function(data) {
    data.created_at = new Date();
    return this._super.apply(this, arguments);
  }
});

app.use('/todos', myService);
```

## Options

The following options can be passed when creating a new memory service:

- `idField` - The name of the id field property. Default is `id`
- `startId` - An id number to start with that will be incremented for new record (default: `0`)
- `store` - An object with id to item assignments to pre-initialize the data store
- `paginate` - A pagination object containing a `default` and `max` page size (see below)

## Pagination

When initializing the service you can set the following pagination options in the `paginate` object:

- `default` - Sets the default number of items
- `max` - Sets the maximum allowed number of items per page (even if the `$limit` query parameter is set higher)

When `paginate.default` is set, `find` will return an object (instead of the normal array) in the following form:

```
{
  "total": "<total number of records>",
  "limit": "<max number of items per page>",
  "skip": "<number of skipped items (offset)>",
  "data": [/* data */]
}
```

## Query Parameters

The `find` API allows the use of `$limit`, `$skip`, `$sort`, and `$select` in the query.  These special parameters can be passed directly inside the query object:

```js
// Find all recipes that include salt, limit to 10, only include name field.
{"ingredients":"salt", "$limit":10, "$select": ["name"] } } // JSON

GET /?ingredients=salt&$limit=10&$select[]=name // HTTP
```

As a result of allowing these to be put directly into the query string, you won't want to use `$limit`, `$skip`, `$sort`, or `$select` as the name of fields in your document schema.

### `$limit`

`$limit` will return only the number of results you specify:

```
// Retrieves the first two records found where age is 37.
query: {
  age: 37,
  $limit: 2
}
```

### `$skip`

`$skip` will skip the specified number of results:

```
// Retrieves all except the first two records found where age is 37.
query: {
  age: 37,
  $skip: 2
}
```

### `$sort`

`$sort` will sort based on the object you provide:

```
// Retrieves all where age is 37, sorted ascending alphabetically by name.
query: {
  age: 37,
  $sort: { name: 1 }
}

// Retrieves all where age is 37, sorted descending alphabetically by name.
query: {
  age: 37,
  $sort: { name: -1}
}
```

### `$select`

`$select` support in a query allows you to pick which fields to include or exclude in the results.

```
// Only retrieve name.
query: {
  name: 'Alice',
  $select: {'name': 1}
}

// Retrieve everything except age.
query: {
  name: 'Alice',
  $select: {'age': 0}
}
```


## Filter criteria

In addition to sorting and pagination, properties can also be filtered by criteria. Standard criteria can just be added to the query. For example, the following find all users with the name `Alice`:

```js
query: {
  name: 'Alice'
}
```

Additionally, the following advanced criteria are supported for each property.

### $in, $nin

Find all records where the property does (`$in`) or does not (`$nin`) contain the given values. For example, the following query finds every user with the name of `Alice` or `Bob`:

```js
query: {
  name: {
    $in: ['Alice', 'Bob']
  }
}
```

### $lt, $lte

Find all records where the value is less (`$lt`) or less and equal (`$lte`) to a given value. The following query retrieves all users 25 or younger:

```js
query: {
  age: {
    $lte: 25
  }
}
```

### $gt, $gte

Find all records where the value is more (`$gt`) or more and equal (`$gte`) to a given value. The following query retrieves all users older than 25:

```js
query: {
  age: {
    $gt: 25
  }
}
```

### $ne

Find all records that do not contain the given property value, for example anybody not age 25:

```js
query: {
  age: {
    $ne: 25
  }
}
```

### $or

Find all records that match any of the given objects. For example, find all users name Bob or Alice:

```js
query: {
  $or: [
    { name: 'Alice' },
    { name: 'Bob' }
  ]
}
```


## Changelog

__0.4.0__

- Migrate to new ES6 plugin infrastructure and support all advanced querying mechanisms ([#10](https://github.com/feathersjs/feathers-memory/pull/10))

__0.3.0__

- Fixing how the module is exported.
- Adding `PATCH` support back in

__0.2.2__

- Minor bug fixes

__0.2.1__

- Now utilizing [feathers-errors](https://github.com/feathersjs/feathers-errors)
- Proper documentation

__0.2.0__

- Unknown

__0.1.2__

- Unknown

__0.1.1__

- Unknown

__0.1.0__

- Initial release

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
