var feathers = require('feathers');
var errors = require('feathers-errors');
var memory = require('../lib/memory');
var app = feathers();

app.use('/users', memory)
   .use(errors.handler)
   .listen(8080);

console.log('App listening on 127.0.0.1:8080');