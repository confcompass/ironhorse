

var logger = require('winston');

/**
 *
 * The i18next module initializes i18next translations and registers the
 * Express app helpers and middleware.
 * 
 */
var Plugin = module.exports = {
    name: 'i18next'
};

/**
 * @param {Object} config configuration of the plugin
 * @param {Object} config.i18next i18next module to use for translations
 * @param {Object} config.init parameters that will be passed to `i18next.init()`
 */
Plugin.attach = function (config) {
    
    if (!this.express) {
        throw new Error("The ironhorse/express plugin must be attached before attaching ironhorse/i18next");
    }
    
    logger.info("Attaching the ironhorse/i18next plugin...")

    var i18n = config.i18next;
    this.i18n = i18n;

    i18n.init(config.init || {});

	this.express.before(i18n.handle);
	i18n.registerAppHelper(this.express.server);

};
