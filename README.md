# feathers-memory

[![Build Status](https://travis-ci.org/feathersjs/feathers-memory.png?branch=master)](https://travis-ci.org/feathersjs/feathers-memory)

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
var feathers = require('feathers');
var bodyParser = require('body-parser');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var memory from 'feathers-memory';

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
var port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example with `npm start` from the cloned repository and going to [localhost:3030/messages](http://localhost:3030/messages). You will see the test Message that we created at the end of that file.

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
