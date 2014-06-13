var feathers = require('feathers');
var memory = require('../lib/memory')();
var app = feathers();

app.configure(feathers.rest())
   .use('/users', memory)
   .configure(feathers.errors())
   .listen(8080);

console.log('App listening on 127.0.0.1:8080');