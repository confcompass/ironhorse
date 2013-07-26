
/*
 * Example ironhorse application with a simple hello-world web method,
 * using the Jade view templating engine, and passport for authentication.
 *
 * Use username: james password: bond
 */

var app = require('flatiron').app
  , express = require('express')
  , BasicStrategy = require('passport-http').BasicStrategy
  , logger = require('winston')

/*
 * Attach the Ironhorse plugin,
 * passing an express app, and cookie and session middlewares 
 */ 
app.use(require('../../express'), {
    views: __dirname,
    view_engine: 'jade',
    before: [
      express.cookieParser(),
      express.session({ secret: 'ponies' })
    ]
});

/*
 * Configure passport using HTTP Auth
 */
app.use(require('../../express/passport'), {
});

app.passport.use(new BasicStrategy(
  function(username, password, done) {
    var user = false;
    if (username == 'james' && password == 'bond') {
       user = {
         username: 'james',
         name: 'James'
       }; 
    }
    return done(null, user);
  }
));

/*
 * Tranditional Express-like router configuration
 */
app.express.get('/',
    app.passport.authenticate('basic', { session: false }), 
    function(req, res) {
        res.render('index', {
            user: req.user
        });
});

/*
 * Start the HTTP web server
 */
app.start(3000, function(err) {
    if (err) {
        logger.error(err.stack);
    } else {
        logger.info('App started on port 3000');
    }
});