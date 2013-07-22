
/*
 * Example ironhorse application with a simple hello-world web method,
 * using the Jade view templating engine.
 */

var app = require('flatiron').app
  , express = require('express')
  , logger = require('winston')

/*
 * Attach the Ironhorse plugin,
 * passing an express app 
 */ 
app.use(require('../../express'), {
    server: express(),
    views: __dirname,
    view_engine: 'jade'
});

/*
 * Tranditional Express-like router configuration
 */
app.express.get('/', function(req, res) {
    res.render('index');
});

/*
 * Start the HTTP web server
 */
app.start(3000, function(err) {
    logger.info('App started on port 3000');
});