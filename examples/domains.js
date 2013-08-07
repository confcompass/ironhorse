
/*
 * Example ironhorse application with a simple hello-world web method
 */

var app = require('flatiron').app
  , logger = require('winston')
  , path = require('path')

/*
 * Attach the Ironhorse plugin,
 * passing an express app 
 */ 
app.use(require('../express'), {
});

app.use(require('../domains'), {
	test: {
		url: "mongodb://localhost/test",
		models: path.join(__dirname, 'models')
	}
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
	if (!err) {
    	logger.info('App started on port 3000');
	}
});