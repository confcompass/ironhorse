
var logger = require('winston')
    , _ = require('underscore')
    , async = require('async')
    , Domain = require('./domain')
    , path = require('path')
    , walk = require('fs-walk')

exports.attach = function(config) {

    this.db = {};

    for (var domain in config) {
        logger.info("Attaching DB domain '%s'", domain);
        var db = this.db[domain] = new Domain(config[domain].url, config[domain].options);

        walk.filesSync(config[domain].models, function(basedir, file) {
            if (file.match(/.*\.js/)) {
                var module = path.resolve(
                    process.cwd(), 
                    path.join(basedir, file.replace('.js', '')));
                logger.info("Attaching DB model '%s' to domain '%s'", file, domain);
                require(module)(db.mongoose);
            }
        });

    }

};

exports.init = function(done) {
    var app = this;
    async.each(Object.keys(app.db), function(domain, next) {
        var db = app.db[domain];
        db.connect();
        db.on('open', function() {
            logger.info("DB connection to %s for domain '%s' open", db.url, domain);
            next();
        });
        db.on('error', function(err) {
            logger.err("Failed to open DB connection to %s for domain '%s'", db.url, domain, err);
            next(err);
        });
    }, done);
}