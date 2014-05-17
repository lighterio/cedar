/**
 * Get a logger with one or more transports.
 */
var chip = module.exports = function (transport) {
	if (!(transport instanceof Array)) {
		transport = [transport || 'console'];
	}
	// TODO: Support multiple transports.
  return require('./lib/' + transport[0])();
}

/**
 * Expose the version to module users.
 */
chip.version = require('./package.json').version;
