var Base = require('./base');

/**
 * The `Blackhole` logger drops everything.
 */
module.exports = function (config) {
  config.stream = {write: function () {}};
  return Base(config);
};
