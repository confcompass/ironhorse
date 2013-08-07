
var kue = require('kue')
  , logger = require('winston')
  , redis = require('redis');

/*
 * 
 * The jobs plugin initializes Kue.
 *
 */
var Plugin = module.exports = {};

/**
 * @param {Number} config.port Port where redis is running
 * @param {String} config.host Hostname where the redis instance runs
 * @param {Object} config.auth Authentication options for redis
 * @param {String} config.webPath Path under which the admin webapp will be mounted
 */ 
Plugin.attach = function(config) {

    kue.redis.createClient = function() {
        var client = redis.createClient(config.port, config.host);
        client.on('error', function(error) {
            logger.error("Error in connection to KUE Redis");
        });
        client.on('connect', function() {
            logger.info("Connection to KUE Redis server open");
        })
        if (config.auth) {
            client.auth(config.auth);
        }
        return client;
    };

    this.jobs = kue.createQueue();

    if (this.express && config.webPath) {
        this.express.after(config.webPath, kue.app);
    }

};
