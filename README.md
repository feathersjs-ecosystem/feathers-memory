# feathers-memory

[![Build Status](https://travis-ci.org/feathersjs/feathers-memory.png?branch=master)](https://travis-ci.org/feathersjs/feathers-memory)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-memory/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-memory)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-memory/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-memory/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-memory.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-memory)
[![Download Status](https://img.shields.io/npm/dm/feathers-memory.svg?style=flat-square)](https://www.npmjs.com/package/feathers-memory)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> An in memory CRUD service for Feathers.


## Installation

```bash
npm install feathers-memory --save
```

## Documentation

Please refer to the [Feathers database adapter documentation](http://docs.feathersjs.com/databases/readme.html) for more details or directly at:

- [In Memory](http://docs.feathersjs.com/databases/memory.html) - The detailed documentation for this adapter
- [Extending](http://docs.feathersjs.com/databases/extending.html) - How to extend a database adapter
- [Pagination and Sorting](http://docs.feathersjs.com/databases/pagination.html) - How to use pagination and sorting for the database adapter
- [Querying](http://docs.feathersjs.com/databases/querying.html) - The common adapter querying mechanism

## Complete Example

Here is an example of a Feathers server with a `messages` in-memory service that supports pagination:

```js
const feathers = require('feathers');
const bodyParser = require('body-parser');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const memory = require('feathers-memory');

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable Socket.io services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', memory({
  paginate: {
    default: 2,
    max: 4
  }
}));

// Create a dummy Message
app.service('messages').create({
  text: 'Server message',
  read: false
}).then(function(message) {
  console.log('Created message', message);
});

// Start the server.
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example with `npm start` from the cloned repository and going to [localhost:3030/messages](http://localhost:3030/messages). You will see the test Message that we created at the end of that file.

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
