/**
 * Get a logger with one or more transports.
 */
var api = module.exports = function (transport) {
	if (!(transport instanceof Array)) {
		transport = [transport || 'console'];
	}
	// TODO: Support multiple transports.
	return require('./lib/' + transport[0]);
}

/**
 * Expose the version to module users.
 */
api.version = require('./package.json').version;
