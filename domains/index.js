
var logger = require('winston')
    , async = require('async')
    , Domain = require('./domain')
    , path = require('path')
    , walk = require('fs-walk')

exports.attach = function(config) {

    this.db = {};

    for (var domain in config) {
        logger.info("Attaching DB domain '%s'", domain);
        var db = this.db[domain] = new Domain(config[domain].url, config[domain].options);
        var models = config[domain].models;
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
	                logger.info("Attaching DB model '%s' to domain '%s'", modulebase, domain);
	                require(module)(db.mongoose);
	            }
	        });
	    });
    }

};

exports.init = function(done) {
    var app = this;
    async.each(Object.keys(app.db), function(domain, next) {
        var db = app.db[domain];
        db.connect();
        next();
    }, done);
}