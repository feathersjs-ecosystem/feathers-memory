# feathers-memory [![Build Status](https://travis-ci.org/feathersjs/feathers-memory.svg?branch=master)](https://travis-ci.org/feathersjs/feathers-memory)[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-memory.png)](https://codeclimate.com/github/feathersjs/feathers-memory)

> An in memory CRUD service for [feathers](http://feathersjs.com)

## Getting Started

Install the module with: `npm install feathers-memory --save`

```js
var feathers = require('feathers');
var memory = require('feathers-memory')();

app.configure(feathers.rest()).use('/users', memory);
```

## Documentation

#### API

The feathers-memory service follows the same convention as all the other services. Therefore, it provides the following methods:

`find`, `get`, `create`, `update`, `patch`, `remove` and `setup`.

```js
var memoryService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  patch: function(id, data, params, callback) {},
  remove: function(id, params, callback) {},
  setup: function(app) {}
}
```

#### Usage:

```js
var feathers = require('feathers');
var memory = require('feathers-memory')();
var app = feathers();

app.configure(feathers.rest())
   .use('/users', memory)
   .listen(8080);
```

#### Extending:

You can also extend any of the feathers services to do something custom.

```js
var feathers = require('feathers');
var memory = require('feathers-memory')();
var app = feathers();

var myUserService = memory.extend({
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

#### Advanced Querying

You are probably also going to want to filter your data. You can do that by passing options via the body or in a query string. Like so:

```
GET /users?name=eric&limit=10&skip=10
```

__Sort:__

```
GET /users?sort[]=name&sort[]=age
```

__Order:__

```
GET /users?order=ascending
```

__Skip:__

```
GET /users?skip=10
```

__Limit:__

```
GET /users?limit=10
```

## Examples
See [examples directory](https://github.com/feathersjs/feathers-memory/tree/master/examples).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
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
Copyright (c) 2014 [Eric Kryski](https://github.com/ekryski)
Licensed under the [MIT license](https://github.com/feathersjs/feathers-memory/blob/master/LICENSE-MIT).
