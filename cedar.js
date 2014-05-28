/**
 * Get a logger with one or more transports.
 */
var cedar = module.exports = function (transport, options) {
  if (!(transport instanceof Array)) {
    transport = [transport || 'console'];
  }
  return require('./lib/' + transport[0])(options);
}

/**
 * Expose the version to module users.
 */
cedar.version = require('./package.json').version;
