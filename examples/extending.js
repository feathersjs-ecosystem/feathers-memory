var feathers = require('feathers');
var errors = require('feathers-errors');
var memory = require('../lib/memory');
var app = feathers();

/* jshint unused:false */
var myUserService = memory.extend({
  find: function(params, cb){
    // Do something awesome!
    
    console.log('I am extending the find method');
    
    this._super.apply(this, arguments);
  }
});

app.use('/users', myUserService)
   .use(errors.handler)
   .listen(8080);

console.log('App listening on 127.0.0.1:8080');