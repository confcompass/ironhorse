

var logger = require("winston")
    , _ = require('underscore')
    , util = require('util')
    , EventEmitter = require('events').EventEmitter
    , Mongoose = require('mongoose').Mongoose
    , Filestore = require('./filestore')

var Domain = module.exports = function(url) {
    this.url = url;
    this.mongoose = new Mongoose();
    this.mongoose.Promise = global.Promise;
    this.filestore = new Filestore(this.mongoose);
    this.middleware = new Middleware(this);
}

util.inherits(Domain, EventEmitter);

Domain.prototype.connect = function() {
    var self = this;

    var connect = function() {
        self.mongoose.connect(self.url, {
            useMongoClient: true,
            reconnectTries: 100
        });
    }

    connect();

    var db = this.mongoose.connection;
    self.connected = false;

    db.on('connecting', function() {
        logger.info('Connecting to MongoDB...');
    });

    db.on('error', function() {
        self.connected = false;
        logger.error('Error in MongoDb connection');
    });

    db.on('connected', function() {
        self.connected = true;
        logger.info('MongoDB connected!');
    });

    db.on('open', function() {
        self.connected = true;
        logger.info('MongoDB connection opened!');
    });

    db.on('reconnected', function () {
        self.connected = true;
        logger.info('MongoDB reconnected!');
    });

    db.on('disconnected', function() {
        self.connected = false;
        logger.warn('MongoDB disconnected, will reconnect in 5 seconds!');
        setTimeout(connect, 5000);
    });
}

Domain.prototype.model = function() {
    return this.mongoose.model.apply(this.mongoose, arguments);
}

/**
 *
 * Factory of utility middlewares for Express.
 *
 * @param {Domain} db domain instance that will be bound to the middleware closures.
 * @constructor
 * @private
 */
var Middleware = function(db) {
    this.db = db;
};

/**
 * Middleware that returns a 503 error if
 * the database is not available when making the request.
 */
Middleware.prototype.ready = function(options) {
    var self = this;
    options = options || {};
    var view = options.view;
    var json = options.json || { error: "Service Unavailable" };
    var status = options.status || 503;
    return function(req, res, next) {
        if (self.db.connected) {
            next();
        } else {
            res.format(_.extend({
                html: function() {
                    if (view) {
                        res.status(status);
                        res.render(view, {
                            path: req.path
                        });
                    } else {
                        res.send(status);
                    }
                },
                json: function() {
                    res.json(503, json);
                }
            }, options.format));
        }
    }
}

Middleware.prototype.findById = function(model, param, nfe) {
    var db = this.db;
    return function (req, res, next) {
        var id = db.mongoose.Types.ObjectId(req.params[param]);
        db.model(model).findOne({_id: id}, function(err, document) {
            if (err) {
                return next(err);
            } else if (!document && nfe) {
                return next(nfe);
            } else {
                req.params[param] = document;
                return next();
            }
        });
    }
};
