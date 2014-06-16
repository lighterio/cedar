var base = require('./base');

/**
 * The blackhole logger just drops messages.
 */
module.exports = function createBlackholeLogger() {
  var logger = base({type: 'blackhole'});
  logger.write = function () {};
  return logger;
};
