# ironhorse

Flatiron plugin for Express that borrows some of the good ideas of Union without the route and middleware nonsense.

## Installation

    $ npm install ironhorse

## Quick Start

The `minimal.js` file in the example directory gives you the bare minimum lines of code to get started with Ironhorse. 

```
var app = require('flatiron').app
  , express = require('express')
  , logger = require('winston')

app.use(require('ironhorse/express'), {
    server: express()
});

// Do this inside route plugins
app.express.get('/', function(req, res) {
    res.send(200, 'Hello World!');
});

app.start(3000, function(err) {
    logger.info('App started on port 3000');
});
```


## Features

  * Version-agnostic: you pass the constructed Express instance.
  * Seamless integration of Express into a Flatiron app.
  * Delayed middleware and route setup.
  * Asynchronous initialization.

### Delayed Middleware Setup

The order in which middlewares are passed to the express instance matters, which can be a bit of a headache if you want some plugins to define routes and middleware. That's why Ironhorse borrows the idea of 'before' and 'after' middlewares from Union, combined with the fact that middlewares are not setup in the express instance until the init phase of the flatiron app, giving the chance to other plugins to reorder some middlewares in the attach phase.

## License

(The MIT License)

Copyright (c) 2013 Conference Compass BV 

Maintainer:
Alberto Gonzalez <alberto@conference-compass.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
