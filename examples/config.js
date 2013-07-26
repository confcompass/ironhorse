
/*
 * Example ironhorse application with a simple hello-world web method
 */

var app = require('flatiron').app
  , logger = require('winston')

/*
 * Attach the Ironhorse plugin,
 * passing an express app 
 */ 
app.use(require('../express'), {
});

/** 
 * Attach the config plugin loading some defaults
 * and adding argv overrides
 */
app.use(require('../config'), {
    defaults: {
        name: 'Kitty'
    },
    argv: true
});

/*
 * Tranditional Express-like router configuration
 */
app.express.get('/', function(req, res) {
    res.send(200, 'Hello ' + app.config.get('name'));
});

/*
 * Start the HTTP web server
 */
app.start(3000, function(err) {
    logger.info('App started on port 3000');
});