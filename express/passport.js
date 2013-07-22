

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
    var app = this;
    
    var passport = config.passport;
    
    // use passport session
    app.express.before(passport.initialize());
    app.express.before(passport.session());

    app.passport = passport;

}
