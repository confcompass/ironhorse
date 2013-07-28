
var gridfs = require('gridfs-stream')
  , temp = require('temp')
  , logger = require('winston')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')

/**
 * @class Filestore
 * @extends events.EventEmitter
 *
 * Persistent file storage engine.
 *
 * The filestore is used to save files into persistent storage (in this case, mongodb's GridFS)
 * and allows accessing those files and their metadata. It also allows storing
 *
 * This filestore implementation is base on mongods's GridFS, for more details see the documentations of
 * [node-mongodb-native](http://mongodb.github.io/node-mongodb-native/api-generated/grid.html)
 * and [GridFS](http://docs.mongodb.org/manual/core/gridfs)
 *
 * @constructor
 * @param mongoose Instance of mongoose that backs the filestore
 */
var Filestore = function(mongoose) {
    this._grid = null;
    var self = this;
    mongoose.connection.on('open', function() {
        self._grid = gridfs(this.db, mongoose.mongo);
        /**
         *  @event open
         *  Emitted when the filestore connection is open.
         */
        self.emit('open');
        logger.info("GridFS Filestore ready");
    });
    /**
     * Collection of useful middlewares for Express, bound to this filestore.
     * @property {core.Filestore.Middleware}
     */
    this.middleware = new Middleware(this);
};

util.inherits(Filestore, EventEmitter);

/**
 * Find one file in the filestore that satisfies the given options.
 *
 * @param {Object} options Options (metadata) the found file must satisfy.
 * Allowed options are `_id`, `filename`, `contentType` (see GridFS documentation for more details)
 * @param {String} [root='files'] Filestore root (GridFS concept)
 * @param {Function(err, file)} done Asynchronous return callback.
 */
Filestore.prototype.findOne = function(options, root, done) {
    if (root instanceof Function) {
        done = root;
        root = undefined;
    }
    if (root) {
        this._grid.collection(root).files.findOne(options, done);
    } else {
        this._grid.files.findOne(options, done);
    }
};

/**
 * Store a file stream in the filestore.
 *
 * @param {ReadableStream} stream Data input stream
 * @param {Object} options Storage options (metadata) for the stored file.
 * Allowed options are `_id`, `filename`, `contentType`, `mode`... (see the documentation of GridFS for more details)
 * If no _id is provided, a new file will be stored (even if the filename is repeated) and a new _id will be returned.
 * Otherwise the file will be replaced (`mode: 'w'`) or appended (`mode: 'w+'`)
 * @param {Function(err, file)} done Asynchronous return callback.
 */
Filestore.prototype.put = function(stream, options, done) {
    var ws = this._grid.createWriteStream(options);
    stream.pipe(ws);
    ws.on('close', function(file) {
        done(null, file);
    });
    return ws;
};

/**
 * Retrieve a file from the filestore and write it to a stream.
 *
 * @param {WritableStream} stream Data output stream
 * @param {Object} options Storage options (metadata) the found file must satisfy.
 * Allowed options are `_id`, `filename`, `contentType`...
 * @returns {ReadableStream} the input stram that provides the file data.
 */
Filestore.prototype.get = function(stream, options) {
    var rs = this._grid.createReadStream(options);
    rs.pipe(stream);
    return rs;
};

/**
 * Retrieve a file from the filestore, store it in a temporary folder and return the file's path.
 *
 * ** ATTENTION!! Modifications to the file will not make it back to the file store! **
 *
 * @param {Object} options Storage options (metadata) the found file must satisfy.
 * Allowed options are `_id`, `filename`, `contentType`...
 * @param {Function(err, path)} done Asynchronous return callback.
 */
Filestore.prototype.getAsFile = function(options, suffix, done) {

    var tempArgs;
    
    if(typeof suffix == "string") {
        tempArgs = { suffix: suffix };
    } else if(typeof suffix == "function") {
        done = suffix;
    }

    var ws = temp.createWriteStream(tempArgs);
    var rs = this._grid.createReadStream(options);
    rs.pipe(ws);
    ws.on('close', function() {
        done(null, ws.path);
    });
    rs.on('error', function(err) {
        done(err);
    });
    ws.on('error', function(err) {
        done(err);
    });
};

/**
 * Remove a file (or group of files) from the file store.
 *
 * ** ATTENTION!! Always pass an `options._id`, or you risk wiping the whole filestore! **
 *
 * @param {Object} options Storage options (metadata) the deleted file(s) must satisfy.
 * @param {Function(err)} done Asynchronous return callback.
 */
Filestore.prototype.del = function(options, done) {
    this._grid.remove(options, done);
};

/**
 * @class Filestore.Middleware
 *
 * Factory of utility middlewares for Express.
 *
 * @param {core.Filestore} fs Filestore instance that will be bound to the middleware closures.
 * @constructor
 * @private
 */
var Middleware = function(fs) {
    this.fs = fs;
};

/**
 * Middleware that finds one particular file instance, attaching it as a request parameter.
 *
 * The found file is placed in `req.params[param]`
 *
 * @param {String} param Name of the parameter.
 * @param {Object} options Storage options (metadata) the found file must satisfy.
 * Allowed options are `_id`, `filename`, `contentType`...
 * @param {String} [root='files'] Filestore root (GridFS concept)
 * @param {Error} [nfe=null] Error to be passed to the `next()` middleware if the file is not found
 * (if null, no error is passed).
 * @returns {Function(req, res, next)} Middleware closure.
 */
Middleware.prototype.findOne = function(param, options, root, nfe) {
    var self = this;
    if (root instanceof Error) {
        nfe = root;
        root = undefined;
    }
    return function(req, res, next) {
        self.fs.findOne(options, root, function(err, file) {
            if (err) return next(err);
            if (!file && nfe) {
                return next(nfe);
            }
            req.params[param] = file;
            return next();
        });
    }
};

/**
 * Middleware that finds one particular file instance, and sends it in the response as an attachment.
 *
 * @param {Object} options Storage options (metadata) the found file must satisfy.
 * Allowed options are `_id`, `filename`, `contentType`...
 * @param {String} [root='files'] Filestore root (GridFS concept)
 * @returns {Function(req, res, next)} Middleware closure.
 */
Middleware.prototype.download = function(options, root) {
    var self = this;
    return function(req, res, next) {
        self.fs.findOne(options, root, function(err, file) {
            if (err) return next(err);
            if (!file) {
                return res.send(404, "Not Found");
            }
            res.set('Content-Disposition', 'attachment; filename=' + file.filename);
            res.set('Content-Type', file.contentType);
            res.set('Content-Length', file.length);
            res.set('ETag', file.md5);
            var rs = self.fs.get(res, {_id: file._id});
            rs.on('error', next);
        });
    };
}

module.exports = Filestore;