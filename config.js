/*
 * Plugin that holds the current application cofiguration.
 *
 * Currently implemented on top of [nconf](https://github.com/flatiron/nconf).
 *
 */
var nconf = require('nconf')
  , path = require('path')
  , logger = require('winston')
  , util = require('util')


function yaml() {
    try {
        return require('libyaml');
    } catch (ex) {
        throw new Error('To use config.yaml you must have \'libyaml\' as dependency');
    }
}

/*
 * private nconf parser interface implementation that provides
 * support for YAML configuration documents.
 * Since a YAML file can contain more than one YAML document,
 * we take only the first one (and warn if there are more)
 *
 */
var YamlConfigParser = {
    parse: function(str) {
        var YAML = yaml();
        var documents = YAML.parse(str);
        if (documents.length > 1) {
            logger.warn('Parsed YAML configuration contained more than one document, only the first will be loaded');
        }
        return documents[0];
    },
    stringify: function(o) { 
        var YAML = yaml();
        return YAML.stringify(o);
    }
};

var Plugin = module.exports = {};

/**
 * This plugin loads a new nconf provider and attaches to `app.config`.
 * 
 * The following options are supported, in order of precedence.
 *
 * @param {Boolean} options.argv Loads the command line arguments passed to node 
 * @param {Boolean} options.env  Loads the environments variables 
 * @param {String} options.yaml  Loads a YAML configuration file from the path passed as string  
 * @param {Object} options.defaults Loads a programmatic set of defaults with top priority
 */
Plugin.attach = function(options) {
    
    var app = this;

    var cfg = app.config = new nconf.Provider();
    
    if (options.argv) {
        // 1. Command line
        cfg.argv();
    }
    
    if (options.env) {
        // 2. process.env
        cfg.env();
    }
    
    if (options.yaml) {
        cfg.use('file', {
            file: path.resolve(root, options.yaml),
            format: YamlConfigParser
        });
    }

    if (options.defaults) {
        cfg.defaults(options.defaults);
    }
    
}

