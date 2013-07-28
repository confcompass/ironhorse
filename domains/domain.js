

var logger = require("winston")
    , util = require('util')
    , EventEmitter = require('events').EventEmitter
    , Mongoose = require('mongoose').Mongoose
    , Filestore = require('./filestore')

var Domain = module.exports = function(url, options) {
    this.url = url;
    this.options = options || {};
    this.mongoose = new Mongoose();
    this.filestore = new Filestore(this.mongoose);
    this.middleware = new Middleware(this);
}

util.inherits(Domain, EventEmitter);

Domain.prototype.connect = function(url, options) {
    var self = this;
    this.mongoose.connect(this.url, this.options);

    var db = this.mongoose.connection;

    db.on('connecting', function() {
        logger.info('Connecting to MongoDB...');
    });

    db.on('error', function(error) {
        logger.error('Error in MongoDb connection', error);
        self.emit(error);
    });

    db.on('connected', function() {
        logger.info('MongoDB connected!');
    });

    db.on('open', function() {
        logger.info('MongoDB connection opened!');
        self.emit('open');
    });

    db.on('reconnected', function () {
        logger.info('MongoDB reconnected!');
    });

    db.on('disconnected', function() {
        logger.warn('MongoDB disconnected!');
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