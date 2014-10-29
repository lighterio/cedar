/**
 * Create and return a logger with one or more transports.
 */
var cedar = module.exports = function (arg, config) {

  // The default transport is `console`.
  var transport = arg || 'console';

  // If Cedar is called with an Array, it's a multi-transport config list.
  if (arg instanceof Array) {
    config = arg;
    transport = 'multi';
  }

  // Make sure a config exists and a transport is specified.
  config = config || {};
  config.transport = transport;

  return require('./lib/transports/' + transport)(config);
};

/**
 * Expose the Cedar version via package.json lazy loading.
 */
Object.defineProperty(cedar, 'version', {
  get: function () {
    return require('./package.json').version;
  }
});
