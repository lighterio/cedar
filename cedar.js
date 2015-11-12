// Wrap JSON.stringify with a circular-safe function.
require('./common/json/stringify')

/**
 * Create and return a log with one or more transports.
 */
var cedar = module.exports = process.cedar || function (arg, config) {

  // The default transport is `console`.
  var transport = arg || 'console'

  // If Cedar is called with an Array, it's a multi-transport config list.
  if (arg instanceof Array) {
    config = arg
    transport = 'multi'
  }

  // Make sure a config exists and a transport is specified.
  config = config || {}
  config.transport = transport

  return require(__dirname + '/lib/transports/' + transport)(config)
}
