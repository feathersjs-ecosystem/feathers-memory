var feathers = require('feathers');
var bodyParser = require('body-parser');
var memory = require('../lib');

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

// Start the server
module.exports = app.listen(3030);
