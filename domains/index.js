var logger = require('winston'),
    async = require('async'),
    Domain = require('./domain'),
    path = require('path'),
    walk = require('fs-walk');

var attachDomain = function(name, domain, dbs, callback) {
    logger.info("Attaching DB domain '%s'", name);
    var db = dbs[name] = new Domain(domain.url, domain.options);
    var models = domain.models;
    if ('string' === typeof(models)) {
        models = [models];
    }
    models.forEach(function(models_path) {
        walk.filesSync(models_path, function(basedir, file) {
            if (file.match(/.*\.js/)) {
                var modulebase = path.join(basedir, file.replace('.js', ''));
                var module = path.resolve(
                    process.cwd(),
                    modulebase);
                logger.info("Attaching DB model '%s' to domain '%s'", modulebase, name);
                require(module)(db.mongoose);
            }
        });
    });

    if (callback) {
        callback();
    }
};

var initDomain = function(app, domain, callback) {
    var db = app.db[domain];
    db.connect();
    callback();
};

exports.initDomain = initDomain;

exports.attachDomain = attachDomain;

exports.attach = function(config) {
    this.db = {};

    for (var domain in config) {
        attachDomain(domain, config[domain], this.db);
    }
};

exports.init = function(done) {
    var app = this;
    async.each(Object.keys(app.db), function(domain, next) {
        initDomain(app, domain, next);
    }, done);
};
