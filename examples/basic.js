var feathers = require('feathers');
var memory = require('../lib/memory')();
var bodyParser = require('body-parser');
var app = feathers();

app.configure(feathers.rest())
   .use(bodyParser.json())
   .use('/users', memory)
   .configure(feathers.errors())
   .listen(8080);

console.log('App listening on 127.0.0.1:8080');