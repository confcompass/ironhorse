

var logger = require('winston')

function express() {
    try {
        var xp = require('express');
    } catch (ex) {
        throw new Error('No server instance was provided. We tried to start our own, but we could not load the express module.');
    }
    return xp();
}

var Express = function(options) {
    this.server = options.server || express();
    this._before = [];
    this._after = [];
    this._routes = [];
    if (options.before instanceof Array) {
        options.before.forEach(function(bf) {
            if (!(bf instanceof Array)) {
                bf = [bf];
            }
            this.before.apply(this, bf);
        }, this);
    }
    if (options.after instanceof Array) {
        options.after.forEach(function(af) {
            if (!(af instanceof Array)) {
                af = [af];
            }
            this.after.apply(this, af);
        }, this);
    }
};

Express.prototype.use = function() {
    this.server.use.apply(this.server, arguments);
};

Express.prototype.set = function() {
    this.server.set.apply(this.server, arguments);
};

Express.prototype.get = function(name) {
    if (arguments.length == 1) {
        return this.server.get(name);
    } else {
        this._routes.push({verb: "get", args: arguments});
    }
};

["post", "put", "del", "delete", "param"].forEach(function (method) {
    Express.prototype[method] = function() {
        this._routes.push({verb: method, args: arguments});
    };
});

Express.prototype.before = function() {
    this._before.push(arguments);
};

Express.prototype.after = function() {
    this._after.push(arguments);
};

Express.prototype.init = function(done) {
    try {
        logger.info("Registering %d 'before' middlewares", this._before.length);
        this._before.forEach(function(args) {
            this.server.use.apply(this.server, args);
        }, this);
        logger.info("Registering %d routes", this._routes.length);
        this._routes.forEach(function(route) {
            logger.info("    %s %s", route.verb.toUpperCase(), route.args[0].toString());
            this.server[route.verb].apply(this.server, route.args);
        }, this);
        logger.info("Registering %d 'after' middlewares", this._after.length);
        this._after.forEach(function(args) {
            this.server.use.apply(this.server, args);
        }, this);
        return done();
    } catch (err) {
        return done(err);
    }
};

Express.prototype.listen = function(port, host, callback) {
    if (!callback && typeof host === 'function') {
        callback = host;
        host = null;
    }

    this.server.listen(port, host, callback);
};

var Plugin = module.exports = {
    name: "express"
};

Plugin.attach = function(options) {

    var app = this;

    app.express = new Express(options);

    if (options.view_engine) {
        app.express.set('view engine', options.view_engine);
    }

    if (options.views) {
        app.express.set('views', options.views);
    }

    app.start = function(port, host, callback) {
        if (!callback && typeof host === 'function') {
            callback = host;
            host = null;
        }

        app.init(function (err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            } else {
                app.express.listen(port, host, callback);
            }
        });
    }
};

Plugin.detach = function() {
    delete this.express;
}

Plugin.init = function(done) {
    this.express.init(done);
};
