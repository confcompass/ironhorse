
/*
 * Example ironhorse application with a simple hello-world web method
 */

var app = require('flatiron').app
  , express = require('express')
  , logger = require('winston')

/*
 * Attach the Ironhorse plugin,
 * passing an express app 
 */ 
app.use(require('../express'), {
    server: express()
});

/*
 * Tranditional Express-like router configuration
 */
app.express.get('/', function(req, res) {
    res.send(200, 'Hello World!');
});

/*
 * Start the HTTP web server
 */
app.start(3000, function(err) {
    logger.info('App started on port 3000');
});