
var logger = require('winston');

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
    
    var passport = this.passport = config.passport;
    
    // use passport session
    this.express.before(passport.initialize());
    this.express.before(passport.session());

}
