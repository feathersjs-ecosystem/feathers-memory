# feathers-memory

[![Build Status](https://travis-ci.org/feathersjs/feathers-memory.png?branch=master)](https://travis-ci.org/feathersjs/feathers-memory)

> An in memory CRUD service for Feathers.


## Installation

```bash
npm install feathers-memory --save
```


## Getting Started

Creating an in-memory service is this simple:

```js
var memory = require('feathers-memory');
app.use('/todos', memory());
```

This will create a `todos` datastore with the default configuration.

### Complete Example

Here is an example of a Feathers server with a `todos` in-memory service.

```js
// server.js
var feathers = require('feathers'),
  bodyParser = require('body-parser'),
  memory = require('feathers-memory');

// Create a feathers instance.
var app = feathers()
  // Setup the public folder.
  .use(feathers.static(__dirname + '/public'))
  // Enable Socket.io
  .configure(feathers.socketio())
  // Enable REST services
  .configure(feathers.rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }))

// Connect to the db, create and register a Feathers service.
app.use('/todos', memory());

// Start the server.
var port = 8080;
app.listen(port, function() {
  console.log('Feathers server listening on port ' + port);
});
```

You can run this example by using `node examples/basic` and going to [localhost:8080/todos](http://localhost:8080/todos). You should see an empty array. That's because you don't have any Todos yet but you now have full CRUD for your new todos service.

### Extending

You can also extend any of the feathers services to do something custom.

```js
var feathers = require('feathers');
var memory = require('feathers-memory');
var app = feathers();

var myUserService = memory().extend({
  find: function(params, cb){
    // Do something awesome!

    console.log('I am extending the find method');

    this._super.apply(this, arguments);
  }
});

app.configure(feathers.rest())
   .use('/users', myUserService)
   .listen(8080);
```


## Options

The following options can be passed when creating a new memory service:

- `idField` - The name of the id field property. Default is `id`
- `startId` - An id number to start with that will be incremented for new record (default: `0`)
- `store` - An object with id to item assignments to pre-initialize the data store


## Query Parameters

The `find` API allows the use of `$limit`, `$skip`, `$sort`, and `$select` in the query.  These special parameters can be passed directly inside the query object:

```js
// Find all recipes that include salt, limit to 10, only include name field.
{"ingredients":"salt", "$limit":10, "$select": { "name" :1 } } // JSON

GET /?ingredients=salt&$limit=10&$select[name]=1 // HTTP
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

`$select` support in a query allows you to pick which fields to include or exclude in the results.  Note: you can use the include syntax or the exclude syntax, not both together.  See the section on [`Projections`](https://github.com/louischatriot/nedb#projections) in the NeDB docs.
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
