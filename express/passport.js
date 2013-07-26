
var logger = require('winston');

function passport() {
    try {
        var p = require('passport');
    } catch (ex) {
        throw new Error('No passport instance was provided. We tried to start our own, but we could not load the \'passport\' module.');
    }
    return new p.Passport();
}

/**
 *
 * The passport module initializes Passport authentication, to
 * be used as middleware in the Express app.
 * 
 */
var Plugin = module.exports = {};

/**
 * @param {Object} config configuration of the plugin
 * @param {Object} config.passport Passport module to use for the authentication
 */
Plugin.attach = function (config) {
    
    if (!this.express) {
        throw new Error("The ironhorse/express plugin must be attached before attaching ironhorse/passport");
    }

    logger.info("Attaching the ironhorse/passport plugin...")
    
    this.passport = config.passport || passport();
    
    // use passport session
    this.express.before(this.passport.initialize());
    this.express.before(this.passport.session());

}
